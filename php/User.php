<?php
/*
this class is used for both authentication and loading/saving rows in the users
table like a regular DbRow class.
*/

require_once "date.php";
require_once "Db.php";
require_once "php/Session.php";
require_once "DbRow.php";

class User extends DbRow {
	use Singleton;

	public $signedin=false;

	public $username;
	public $password;
	public $email;
	public $join_date;
	public $quick_challenges_as_white=0;
	public $quick_challenges_as_black=0;

	protected $fields=[
		"username",
		"password",
		"email",
		"join_date",
		"reg_ip",
		"quick_challenges_as_white",
		"quick_challenges_as_black"
	];

	protected $row;
	protected $table_name="users";

	public function load_by_username($username) {
		$this->load_row($this->db->row("select * from {$this->table_name} where username='$username'"));
	}

	public function friends_with($user) {
		return self::friends($this->username, $user);
	}

	public static function friends($user1, $user2) {
		return !!$this->db->row("
			select usera
			from relationships
			where type='".RELATIONSHIP_TYPE_FRIENDS."'
			and (
				(usera='$user1' and userb='$user2')
				or (usera='$user2' and userb='$user1')
			)
		");
	}

	public function save() {
		if($this->is_new) {
			$this->join_date=time();
			$this->reg_ip=$_SERVER["REMOTE_ADDR"];
		}

		return parent::save();
	}

	public function sign_in_noauth($user) {
		$row=$this->db->row("select * from {$this->table_name} where username='$user'");

		if($row!==false) {
			$this->load_row($row);
			$this->signedin=true;
		}
	}

	public function sign_in($user, $pass) {
		$session=Session::getinst();

		$row=$this->db->row("select * from {$this->table_name} where username='$user' and password='$pass'");

		if($row!==false) {
			$this->load_row($row);
			$this->signedin=true;

			$session->set(__CLASS__, $user);
		}
	}

	public function sign_out() {
		$session=Session::getinst();
		$this->signedin=false;
		$session->remove($this->session_key);
	}

	/*
	check the session to see if a user is logged in
	*/

	public function session_login() {
		$session=Session::getinst();
		$user=$session->get(__CLASS__);

		if($user) {
			$this->sign_in_noauth($user);
		}
	}
}
?>
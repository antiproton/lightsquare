<?php
require_once "MemcachedServer.php";
require_once "vendor/autoload.php";
require_once "Singleton.php";

class Session extends Symfony\Component\HttpFoundation\Session\Session {
	use Singleton;

	public static $instance=null;

	function create_instance() {
		if(class_exists("Memcached")) { //FIXME this is bollocks - can't get memcached working on fedora though
			$memcached=MemcachedServer::getinst();
			$handler=new Symfony\Component\HttpFoundation\Session\Storage\Handler\MemcachedSessionHandler($memcached);
		}

		else {
			$handler=new Symfony\Component\HttpFoundation\Session\Storage\Handler\NativeFileSessionHandler();
		}

		$storage=new Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage([], $handler);

		$inst=new self($storage);

		return $inst;
	}
}
?>
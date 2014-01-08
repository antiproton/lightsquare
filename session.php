<?php
if(!isset($_COOKIE["session"])) {
	setcookie("session", $_SERVER["REMOTE_ADDR"].md5(openssl_random_pseudo_bytes(32)));
}
?>
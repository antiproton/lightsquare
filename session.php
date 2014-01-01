<?php
if(!isset($_COOKIE["session"])) {
	setcookie("session", md5(openssl_random_pseudo_bytes(64)));
}
?>
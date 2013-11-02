<?php
require_once "MemcachedServer.php";
require_once "vendor/autoload.php";

class Session extends Symfony\Component\HttpFoundation\Session\Session {
	public static $instance=null;

	function getinst() {
		if(self::$instance===null) {
			$memcached=MemcachedServer::getinst();
			$handler=new Symfony\Component\HttpFoundation\Session\Storage\Handler\MemcachedSessionHandler($memcached);
			$storage=new Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage([], $handler);

			self::$instace=new self($storage);
		}

		return self::$instance;
	}
}
?>
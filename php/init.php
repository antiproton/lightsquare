<?php
/*
common requires
*/

require_once "base.php";
require_once "date.php";
require_once "php/constants.php";
require_once "php/User.php";
require_once "php/Session.php";

$user=User::getinst();
$user->session_login();
?>
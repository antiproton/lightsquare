<?php
require_once "base.php";
require_once "include_utils.php";
require_once "php/init.php";
require_once "WidgetLoader.php";

$widgetLoader=new WidgetLoader("widgets");

$widgetLoader->load([
	"BoardSquare",
	"Board",
	"History",
	"LiveTableStandard"
]);
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Chess</title>
		<?php
		style_tags_w("/css/main.css");
		style_tags_s("/lib/css/reset.css");
		style_tags_s("/lib/css/common.css");
		?>
		<style>
		<?php
		$widgetLoader->outputCss();
		?>
		</style>
		<script data-main="js/main" src="/lib/js/require.js"></script>
	</head>
	<body>
		<?php
		$widgetLoader->outputTemplates();
		?>
		<div id="topbar">
			<div class="layout_main">
				<div id="title">
					Chess
				</div>
				<div id="user">
					asd
				</div>
				<div class="cb i"></div>
			</div>
		</div>
		<div class="main">
			<div id="page">
				<h1 class="pagetitle">Opening explorer</h1>
				<div id="table">
				</div>
			</div>
		</div>
	</body>
</html>
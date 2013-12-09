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
		<?php
		script_tags_s("/lib/js/util");
		script_tags_s("/lib/js/server");
		script_tags_s("/lib/js/events");
		script_tags_s("/lib/js/dom");
		script_tags_s("/lib/js/List.js");
		script_tags_s("/lib/js/serialise.js");

		script_tags_s("/lib/js/dbenums/chess.js");
		script_tags_s("/lib/js/dbcodes/chess.js");

		script_tags_w("/js/constants.js");
		script_tags_w("/js/chess/constants.js");
		script_tags_w("/js/chess/MoveLabel.js");
		script_tags_w("/js/chess/Fen.js");
		script_tags_w("/js/chess");
		?>
		<script>
		<?php
		$widgetLoader->outputJs();
		?>
		</script>
		<style>
		<?php
		$widgetLoader->outputCss();
		?>
		</style>
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
		<script>
		var tableWidget=new LiveTableStandardWidget(g("table"));



		tableWidget.board.setSquareSize(45);

		var game=new Game();

		tableWidget.board.setBoard(game.position.board);


		</script>
	</body>
</html>
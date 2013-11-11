<?php
require_once "base.php";
require_once "include_utils.php";
require_once "php/init.php";
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
		script_tags_s("/lib/js/data");
		script_tags_s("/lib/js/server");
		script_tags_s("/lib/js/events");
		script_tags_s("/lib/js/dom");

		script_tags_s("/lib/js/dbenums/chess.js");
		script_tags_s("/lib/js/dbcodes/chess.js");

		script_tags_w("/js/constants.js");
		script_tags_w("/js/chess/constants.js");
		script_tags_w("/js/chess");
		script_tags_w("/js/analysis");
		script_tags_w("/js/controls");
		script_tags_w("/js/livechess");
		script_tags_w("/js/uis");
		?>
		<script src="/lib/js/jquery.js"></script>
	</head>
	<body>
		<?php
		require_once "templates/live_table_std.php";
		?>
		<div id="topbar">
			<div class="main">
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
			<div class="col1">
				<div class="nav">
					<h2>Tools</h2>
					<a href="/editor">Game editor</a>
					<br>
					<a href="/openings">Opening explorer</a>
					<br>
					<a href="/pgn">PGN viewer</a>
					<br>
					<a href="/database">Games database</a>
				</div>
				<div class="nav">
					<h2>Play</h2>
					<a href="/echess">Correspondence games</a>
					<a href="/live">Live chess</a>
				</div>
			</div>
			<div class="col2">
				<div id="page">
					<h1 class="pagetitle">Opening explorer</h1>
					<div id="table">
					</div>
				</div>
			</div>
		</div>
		<script>
		var ui=new LiveTableStdUi(g("table"));

		ui.Board.SquareSize(60);

		ui.Board.SetFen(FEN_INITIAL);
		</script>
	</body>
</html>
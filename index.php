<?php
require_once "base.php";
require_once "php/init.php";
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Chess</title>
		<style type="text/css">
		<?php
		loads("/lib/css/reset.css");
		loads("/lib/css/common.css");
		loadw("/css/main.css");
		?>
		</style>
		<script type="text/javascript">
		<?php
		loads("/lib/js/util");
		loads("/lib/js/data");
		loads("/lib/js/server");
		loads("/lib/js/events");
		loads("/lib/js/dom");
		loads("/lib/js/base");
		loads("/lib/js/Base.js");
		?>
		</script>
	</head>
	<body>
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
					<div id="board">
					</div>
				</div>
			</div>
		</div>
		<script>

		</script>
	</body>
</html>
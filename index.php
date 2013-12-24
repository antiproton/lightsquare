<?php
require_once "include_utils.php";
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Chess</title>
		<link rel="stylesheet" href="/css/main.css">
		<script>
		var global=window;

		var require={
			baseUrl: "js",
			paths: {
				"lib": "/lib/js"
			},
			map: {
				"*": {
					"css": "lib/require-css/css",
					"file": "lib/require-text/text"
				}
			},
			urlArgs: "timestamp="+(new Date()).valueOf(),
			pluginSeparator: "@"
		};
		</script>
		<script data-main="main" src="/lib/js/requirejs/require.js"></script>
	</head>
	<body>
		<div id="topbar">
			<div class="layout_main">
				<div id="title">
					Chess
				</div>
				<div id="user">
					asd
				</div>
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
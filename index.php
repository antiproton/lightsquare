<?php
require_once "session.php";
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Chess</title>
		<link rel="stylesheet" href="/css/main.css">
		<script>
		var global = window;

		var require = {
			baseUrl: "js/client",
			paths: {
				"lib": "/lib/js"
			},
			map: {
				"*": {
					"css": "lib/require-css/css",
					"file": "lib/require-text/text",
					"chess": "../chess"
				}
			},
			urlArgs: "timestamp=" + (new Date()).valueOf(),
			pluginSeparator: "@"
		};
		</script>
		<script data-main="main" src="/lib/js/requirejs/require.js"></script>
	</head>
	<body>
		<div id="top_bar">
			<div id="nav">
				NodeChess
			</div>
			<div id="user">
				
			</div>
		</div>
		<div id="tab_bar">
			
		</div>
		<div id="tab_body">
			
		</div>
	</body>
</html>
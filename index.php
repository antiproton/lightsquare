<?php
require_once "session.php";
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Chess</title>
		<link rel="stylesheet" href="/css/main.css">
		<script>
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
		<div id="logo">
			
		</div>
		<div id="nav">
			
		</div>
		<div id="games">
			
		</div>
		<div id="table">
			
		</div>
	</body>
</html>
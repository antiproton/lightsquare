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
		<script>
		var global=window;
		</script>
		<script src="/lib/js/Function.js"></script>
		<script src="/js/chess/constants.js"></script>
		<!-- use regular php (or js version of) loadw/loads here -->
		<script>
		var require={
			baseUrl: "js",
			paths: {
				"lib": "/lib/js"
			},
			map: {
				"*": {
					"css": "lib/require-css/css",
					"file": "lib/text/text"
				}
			},
			urlArgs: "timestamp="+(new Date()).valueOf()
		};
		</script>
		<script data-main="main" src="/lib/js/require.js"></script>
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
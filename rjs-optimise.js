({
	appDir: "./",
	dir: "../lightsquare-optimised",
	baseUrl: "./bower_components",
	map: {
		"*": {
			"css": "require-css/css",
			"file": "require-text/text",
			"ready": "require-domReady/domReady"
		}
	},
	name: "lightsquare/main",
	skipDirOptimize: true,
	keepBuildDir: true
})
({
	appDir: "/home/gus/projects/lightsquare/js",
	dir: "/home/gus/projects/lightsquare-optimised/js",
	baseUrl: "./",
	paths: {
		"lib": "/home/gus/projects/js",
		"Array.prototype": "/home/gus/projects/Array.prototype",
		"tokeniser": "/home/gus/projects/tokeniser",
		"websocket": "/home/gus/projects/websocket",
		"dom": "/home/gus/projects/dom",
		"routing": "/home/gus/projects/routing",
		"json-local-storage": "/home/gus/projects/json-local-storage",
		"chess": "/home/gus/projects/chess",
		"jsonchess": "/home/gus/projects/jsonchess",
		"require": "/home/gus/projects/lib/require",
		"ractive": "/home/gus/projects/lib/ractive"
	},
	map: {
		"*": {
			"css": "require/css/css",
			"file": "require/text",
			"ready": "require/domReady"
		}
	},
	name: "main"
})
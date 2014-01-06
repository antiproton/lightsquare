var requirejs=require("requirejs");

requirejs.config({
	nodeRequire: require,
	paths: {
		"lib": "/var/www/lib/js"
	},
	map: {
		"*": {
			"chess": "../chess"
		}
	}
});

requirejs(["./server"], function(server) {
	server.run();
});
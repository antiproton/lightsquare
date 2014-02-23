define(function(require) {
	require("lib/dom/ready@");
	var Server = require("lib/websocket-client/Server");
	var $ = require("lib/dom/byId");
	var TabControl = require("lib/widgets/TabControl/TabControl");
	
	server = new Server("ws://chess:8080");
	server.connect();
	
	server.subscribe("*", function(url, data) {
		if(url !== "/keepalive") {
			console.log(url, data);
		}
	});
});
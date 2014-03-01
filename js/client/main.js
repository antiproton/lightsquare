define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket-client/Server");
	var Application = require("./Application");
	var LightsquareUi = require("./widgets/LightsquareUi/LightsquareUi");
	
	var server = new Server("ws://chess:8080");
	var app = new Application(server);
	var ui = new LightsquareUi(document.body, app);
	
	server.connect();
});
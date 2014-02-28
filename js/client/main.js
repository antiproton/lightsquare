define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket-client/Server");
	var Application = require("./Application");
	var LightSquareUi = require("./widgets/LightSquareUi/LightSquareUi");
	
	var server = new Server("ws://chess:8080");
	var app = new Application(server);
	var ui = new LightSquareUi(document.body, app);
	
	server.connect();
});
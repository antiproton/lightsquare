define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket-client/Server");
	var Application = require("./Application");
	var LightsquareUi = require("./widgets/Lightsquare/Lightsquare");
	
	var server = new Server("ws://" + window.location.hostname + ":8080");
	var app = new Application(server);
	var ui = new LightsquareUi(app, document.body);
	
	server.connect();
});
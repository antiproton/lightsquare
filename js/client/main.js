define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket-client/Server");
	var Application = require("./Application");
	var Lightsquare = require("./widgets/Lightsquare/Lightsquare");

	var server = new Server("ws://" + window.location.hostname + ":8080");
	var app = new Application(server);
	var ui = new Lightsquare(app, document.body);
});
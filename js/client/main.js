define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket/client/Server");
	var User = require("./User");
	var Application = require("./Application");
	var Lightsquare = require("./widgets/Lightsquare/Lightsquare");

	var server = new Server("ws://" + window.location.hostname + ":8080");
	
	server.ConnectionOpened.addHandler(this, function() {
		var user = new User(server);
		var app = new Application(server);
		var ui = new Lightsquare(app, user, document.body);
		
		return true;
	});
});
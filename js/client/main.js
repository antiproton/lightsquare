define(function(require) {
	require("lib/dom/ready!");
	var Client = require("lib/websocket/client/Client");
	var Application = require("./Application");
	var Lightsquare = require("./widgets/Lightsquare/Lightsquare");

	var client = new Client("ws://" + window.location.hostname + ":8080");
	
	client.ConnectionOpened.addHandler(this, function() {
		var user = new User(client);
		var app = new Application(user);
		var ui = new Lightsquare(app, user, document.body);
		
		return true;
	});
});
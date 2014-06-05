define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket/client/Server");
	var User = require("./User");
	var Application = require("./Application");
	var Lightsquare = require("./widgets/site/Lightsquare/Lightsquare");
	var LoadingIndicator = require("./widgets/site/LoadingIndicator/LoadingIndicator");

	var server = new Server("ws://" + window.location.hostname + ":8080");
	var loadingIndicator = new LoadingIndicator(document.body, 3);
	
	server.ConnectionOpened.addHandler(this, function() {
		loadingIndicator.remove();
		
		var user = new User(server);
		var app = new Application(server);
		var ui = new Lightsquare(app, user, document.body);
		
		user.Replaced.addHandler(this, function() {
			window.location.replace("/");
		});
		
		server.ConnectionOpened.addHandler(this, function() {
			window.location.reload();
		});
		
		return true;
	});
});
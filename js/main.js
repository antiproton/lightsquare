define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket/client/Server");
	var JsonLocalStorage = require("lib/JsonLocalStorage");
	var User = require("./User");
	var Application = require("./Application");
	var Lightsquare = require("./widgets/site/Lightsquare/Lightsquare");

	var db = new JsonLocalStorage("/lightsquare");
	var server = new Server("ws://" + window.location.hostname + ":8080");
	var user = new User(server, db);
	var app = new Application(server);
	var ui = new Lightsquare(server, app, user, document.body);
});
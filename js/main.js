define(function(require) {
	require("ready!");
	var Server = require("websocket/Server");
	var JsonLocalStorage = require("json-local-storage/JsonLocalStorage");
	var User = require("./User");
	var Lightsquare = require("./widgets/site/Lightsquare/Lightsquare");

	var db = new JsonLocalStorage("/lightsquare");
	var server = new Server("ws://" + window.location.hostname + ":8080");
	var user = new User(server, db);
	var lightsquare = new Lightsquare(user, server, document.getElementById("main"));
});
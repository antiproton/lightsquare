define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket/client/Server");
	var JsonLocalStorage = require("lib/JsonLocalStorage");
	var User = require("./User");
	var ChallengeList = require("./ChallengeList");
	var Lightsquare = require("./widgets/site/Lightsquare/Lightsquare");

	var db = new JsonLocalStorage("/lightsquare");
	var server = new Server("ws://" + window.location.hostname + ":8080");
	var user = new User(server, db);
	var challengeList = new ChallengeList(server);
	var ui = new Lightsquare(server, challengeList, user, document.body);
});
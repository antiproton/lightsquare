define(function(require) {
	require("ready!");
	var Server = require("websocket-client/Server");
	var JsonLocalStorage = require("json-local-storage/JsonLocalStorage");
	var User = require("./User");
	var Lightsquare = require("./Lightsquare/Lightsquare");
	
	var locale = null;
	var queryStringLocale = document.location.href.match(/locale=(\w{2})/);
	
	if(queryStringLocale) {
		locale = queryStringLocale[1];
	}

	var db = new JsonLocalStorage("/lightsquare");
	var server = new Server("ws://" + window.location.hostname + ":8080");
	var user = new User(server, db, locale);
	var lightsquare = new Lightsquare(user, server, document.getElementById("main"));
	
	console.log("Hi :)");
	console.log("To get the source code and/or contribute to the project, go to http://github.com/jsonchess.");
	console.log("A screencast showing the installation and setup can be found at https://www.youtube.com/watch?v=PR2FBr_5wiI.");
});
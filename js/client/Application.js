define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	
	function Application(server) {
		this._server = server;
		
		this.NewChallenge = new Event(this);
		this.NewGame = new Event(this);
		this.ChallengeExpired = new Event(this);
		
		this._server.subscribe("/challenge/new", (function(challenges) {
			challenges.forEach((function(challenge) {
				this.NewChallenge.fire({
					challenge: challenge
				});
			}).bind(this));
		}).bind(this));
		
		this._server.subscribe("/challenge/expired", (function(id) {
			this.ChallengeExpired.fire({
				id: id
			});
		}).bind(this));
		
		this._server.subscribe("/game/new", (function(game) {
			this.NewGame.fire({
				game: new Game(this._server, game)
			});
		}).bind(this));
	}
	
	Application.prototype.createChallenge = function(options) {
		this._server.send("/challenge/create", options);
	}
	
	Application.prototype.acceptChallenge = function(id) {
		this._server.send("/challenge/accept", id);
	}
	
	return Application;
});
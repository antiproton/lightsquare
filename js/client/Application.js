define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	require("lib/Array.getShallowCopy");
	
	function Application(server) {
		this._server = server;
		this._challenges = [];
		this._games = {};
		
		this.NewChallenge = new Event(this);
		this.NewGame = new Event(this);
		this.ChallengeExpired = new Event(this);
		
		this._server.subscribe("/challenges", (function(challenges) {
			challenges.forEach((function(challenge) {
				this._challenges.push(challenge);
				
				this.NewChallenge.fire({
					challenge: challenge
				});
			}).bind(this));
		}).bind(this));
		
		this._server.subscribe("/challenge/expired", (function(id) {
			this._challenges = this._challenges.filter(function(challenge) {
				return (challenge.id !== id);
			});
			
			this.ChallengeExpired.fire({
				id: id
			});
		}).bind(this));
		
		this._server.subscribe("/games", (function(games) {
			games.forEach((function(gameDetails) {
				var game = new Game(this._server, gameDetails);
			
				this._games[gameDetails.id] = game;
				
				this.NewGame.fire({
					game: game
				});
			}).bind(this));
		}).bind(this));
		
		this._server.subscribe("/game", (function(gameDetails) {
			this._addGame(gameDetails);
		}).bind(this));
		
		this._server.send("/request/challenges");
		this._server.send("/request/games");
	}
	
	Application.prototype.createChallenge = function(options) {
		this._server.send("/challenge/create", options);
	}
	
	Application.prototype.acceptChallenge = function(id) {
		this._server.send("/challenge/accept", id);
	}
	
	Application.prototype.getChallenges = function() {
		return this._challenges.getShallowCopy();
	}
	
	Application.prototype._addGame = function(gameDetails) {
		var game = new Game(this._server, gameDetails);
	
		this._games[gameDetails.id] = game;
		
		this.NewGame.fire({
			game: game
		});
	}
	
	Application.prototype.getGames = function() {
		var games = [];
		
		for(var id in this._games) {
			games.push(this._games[id]);
		}
		
		return games;
	}
	
	Application.prototype.getGame = function(id) {
		return this._games[id];
	}
	
	Application.prototype.hasGame = function(id) {
		return (id in this._games);
	}
	
	Application.prototype.spectateGame = function(id) {
		this._server.send("/game/spectate", id);
	}
	
	return Application;
});
define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	require("lib/Array.getShallowCopy");
	var User = require("./User");
	
	function Application(user) {
		this._user = user;
		this._challenges = [];
		this._games = {};
		this._user = new User(this._user);
		
		this.NewChallenge = new Event(this);
		this.GamesReceived = new Event(this);
		this.GameReady = new Event(this);
		this.ChallengeExpired = new Event(this);
		
		this._user.subscribe("/challenges", (function(challenges) {
			challenges.forEach((function(challenge) {
				this._challenges.push(challenge);
				
				this.NewChallenge.fire({
					challenge: challenge
				});
			}).bind(this));
		}).bind(this));
		
		this._user.subscribe("/challenge/expired", (function(id) {
			this._challenges = this._challenges.filter(function(challenge) {
				return (challenge.id !== id);
			});
			
			this.ChallengeExpired.fire({
				id: id
			});
		}).bind(this));
		
		this._user.subscribe("/games", (function(games) {
			var newGames = [];
			
			games.forEach((function(gameDetails) {
				newGames.push(this._addGame(gameDetails));
			}).bind(this));
			
			this.GamesReceived.fire({
				games: newGames
			});
		}).bind(this));
		
		this._user.subscribe("/game", (function(gameDetails) {
			this.GameReady.fire({
				game: this._addGame(gameDetails)
			});
		}).bind(this));
		
		this._user.send("/request/challenges");
		this._user.send("/request/games");
	}
	
	Application.prototype.createChallenge = function(options) {
		this._user.send("/challenge/create", options);
	}
	
	Application.prototype.acceptChallenge = function(id) {
		this._user.send("/challenge/accept", id);
	}
	
	Application.prototype.getChallenges = function() {
		return this._challenges.getShallowCopy();
	}
	
	Application.prototype._addGame = function(gameDetails) {
		var game = new Game(this._user, gameDetails);
	
		this._games[gameDetails.id] = game;
		
		return game;
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
		this._user.send("/game/spectate", id);
	}
	
	return Application;
});
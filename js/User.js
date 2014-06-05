define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	var Glicko = require("chess/Glicko");
	
	function User(server) {
		this._id = null;
		this._games = [];
		this._server = server;
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = Glicko.INITIAL_RATING;
		this._currentChallenge = null;
		this._lastChallengeOptions = null;
		
		this._preferences = {
			alwaysQueen: null,
			pieceStyle: null
		};
		
		this.Replaced = new Event(this);
		this.LoggedIn = new Event(this);
		this.LoginFailed = new Event(this);
		this.LoggedOut = new Event(this);
		this.Registered = new Event(this);
		this.RegistrationFailed = new Event(this);
		this.GamesReceived = new Event(this);
		this.NeededInGame = new Event(this);
		this.DetailsChanged = new Event(this);
		this.HasIdentity = new Event(this);
		this.ChallengeCreated = new Event(this);
		this.ChallengeExpired = new Event(this);
		this.ChallengeAccepted = new Event(this);
		this.ChallengeTimeout = new Event(this);
		this.ChallengeCanceled = new Event(this);
		
		this._subscribeToServerMessages();
		
		this._server.send("/request/user");
		this._server.send("/request/games");
	}
	
	User.prototype.register = function(username, password) {
		this._server.send("/user/register", {
			username: username,
			password: password
		});
	}
	
	User.prototype.login = function(username, password) {
		this._server.send("/user/login", {
			username: username,
			password: password
		});
	}
	
	User.prototype.logout = function() {
		this._server.send("/user/logout");
	}
	
	User.prototype._logout = function() {
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = Glicko.INITIAL_RATING;
		
		this.LoggedOut.fire();
		this.DetailsChanged.fire();
	}
	
	User.prototype.getUsername = function() {
		return this._username;
	}
	
	User.prototype.getPreferences = function() {
		return this._preferences;
	}
	
	User.prototype.updatePreferences = function(preferences) {
		for(var preference in this._preferences) {
			if(preference in preferences) {
				this._preferences[preference] = preferences[preference];
			}
		}
		
		this._server.send("/user/preferences/update", preferences);
	}
	
	User.prototype.getId = function() {
		return this._id;
	}
	
	User.prototype.getRating = function() {
		return this._rating;
	}
	
	User.prototype.isLoggedIn = function() {
		return this._isLoggedIn;
	}
	
	User.prototype.createChallenge = function(options) {
		this._server.send("/challenge/create", options);
	}
	
	User.prototype.cancelChallenge = function() {
		this._server.send("/challenge/cancel");
	}
	
	User.prototype.acceptChallenge = function(id) {
		this._server.send("/challenge/accept", id);
	}
	
	User.prototype.getCurrentChallenge = function() {
		return this._currentChallenge;
	}
	
	User.prototype.getLastChallengeOptions = function() {
		return this._lastChallengeOptions;
	}
	
	User.prototype.hasGamesInProgress = function() {
		return this._games.some((function(game) {
			return (game.getUserColour(this) !== null && game.isInProgress());
		}).bind(this));
	}
	
	User.prototype._addGame = function(gameDetails) {
		var game = new Game(this._server, gameDetails);
	
		this._games.push(game);
		
		return game;
	}
	
	User.prototype.spectateGame = function(id) {
		this._server.send("/game/spectate", id);
	}
	
	User.prototype._subscribeToServerMessages = function() {
		this._server.subscribe("/user/login/success", (function(userDetails) {
			this._loadDetails(userDetails);
			this.LoggedIn.fire();
			this.DetailsChanged.fire();
		}).bind(this));
		
		this._server.subscribe("/user/login/failure", (function(data) {
			this.LoginFailed.fire({
				reason: data.reason
			});
		}).bind(this));
		
		this._server.subscribe("/user/logout", (function() {
			this._logout();
		}).bind(this));
		
		this._server.subscribe("/user/register/success", (function() {
			this.Registered.fire();
		}).bind(this));
		
		this._server.subscribe("/user/register/failure", (function(data) {
			this.RegistrationFailed.fire({
				reason: data.reason
			});
		}).bind(this));
		
		this._server.subscribe("/user/replaced", (function(data) {
			this.Replaced.fire();
		}).bind(this));
		
		this._server.subscribe("/games", (function(games) {
			var newGames = [];
			
			games.forEach((function(gameDetails) {
				newGames.push(this._addGame(gameDetails));
			}).bind(this));
			
			this.GamesReceived.fire({
				games: newGames
			});
		}).bind(this));
		
		this._server.subscribe("/game", (function(gameDetails) {
			var game = this._addGame(gameDetails);
			
			this.GamesReceived.fire({
				games: [game]
			});
			
			this.NeededInGame.fire({
				id: game.getId()
			});
		}).bind(this));
		
		this._server.subscribe("/user", (function(userDetails) {
			this._loadDetails(userDetails);
			this.HasIdentity.fire();
		}).bind(this));
		
		this._server.subscribe("/current_challenge", (function(challengeDetails) {
			this._currentChallenge = challengeDetails;
			
			this.ChallengeCreated.fire({
				details: challengeDetails
			});
		}).bind(this));
		
		this._server.subscribe("/current_challenge/accepted", (function() {
			this._currentChallenge = null;
			
			this.ChallengeAccepted.fire();
			this.ChallengeExpired.fire();
		}).bind(this));
		
		this._server.subscribe("/current_challenge/canceled", (function() {
			this._currentChallenge = null;
			
			this.ChallengeCanceled.fire();
			this.ChallengeExpired.fire();
		}).bind(this));
		
		this._server.subscribe("/current_challenge/timeout", (function() {
			this._currentChallenge = null;
			
			this.ChallengeTimeout.fire();
			this.ChallengeExpired.fire();
		}).bind(this));
	}
	
	User.prototype._loadDetails = function(userDetails) {
		this._id = userDetails.id;
		this._username = userDetails.username;
		this._isLoggedIn = userDetails.isLoggedIn;
		this._rating = userDetails.rating;
		this._currentChallenge = userDetails.currentChallenge;
		this._lastChallengeOptions = userDetails.lastChallengeOptions;
		this._preferences = userDetails.preferences;
		
		this.DetailsChanged.fire();
	}
	
	return User;
});
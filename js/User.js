define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	var Promise = require("lib/Promise");
	var glicko2 = require("jsonchess/glicko2");
	
	function User(server) {
		this._id = null;
		this._games = [];
		this._promises = {};
		
		this._server = server;
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = glicko2.defaults.RATING;
		this._currentChallenge = null;
		this._lastChallengeOptions = null;
		
		this._prefs = {
			alwaysQueen: null,
			pieceStyle: null,
			boardSize: null,
			boardStyle: null
		};
		
		this.Replaced = new Event(this);
		this.LoggedIn = new Event(this);
		this.LoggedOut = new Event(this);
		this.NewGame = new Event(this);
		this.PrefsChanged = new Event(this);
		this.ChallengeCreated = new Event(this);
		this.ChallengeExpired = new Event(this);
		
		this._handleServerEvents();
		this._subscribeToServerMessages();
	}
	
	User.prototype.getDetails = function() {
		var promiseId = "/details";
		var promise;
		
		if(promiseId in this._promises) {
			return this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
			
			this._server.send("/request/user");
		}
		
		return promise;
	}
	
	User.prototype.register = function(username, password) {
		var promiseId = "/register";
		var promise;
		
		if(promiseId in this._promises) {
			promise = this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
			
			promise.then(null, null, (function() {
				delete this._promises[promiseId];
			}).bind(this));
			
			this._server.send("/user/register", {
				username: username,
				password: password
			});
		}
		
		return promise;
	}
	
	User.prototype.login = function(username, password) {
		var promiseId = "/login";
		var promise;
		
		if(promiseId in this._promises) {
			promise = this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
			
			promise.then(null, null, (function() {
				delete this._promises[promiseId];
			}).bind(this));
		
			this._server.send("/user/login", {
				username: username,
				password: password
			});
		}
		
		return promise;
	}
	
	User.prototype.logout = function() {
		var promiseId = "/logout";
		var promise;
		
		if(promiseId in this._promises) {
			promise = this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
			
			promise.then(null, null, (function() {
				delete this._promises[promiseId];
			}).bind(this));
		
			this._server.send("/user/logout");
		}
		
		return promise;
	}
	
	User.prototype._logout = function() {
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = glicko2.defaults.RATING;
		this._games = [];
		this.LoggedOut.fire();
	}
	
	User.prototype.getUsername = function() {
		return this._username;
	}
	
	User.prototype.getPrefs = function() {
		return this._prefs;
	}
	
	User.prototype.updatePrefs = function(prefs) {
		for(var pref in this._prefs) {
			if(pref in prefs) {
				this._prefs[pref] = prefs[pref];
			}
		}
		
		this.PrefsChanged.fire();
		this._server.send("/user/prefs/update", prefs);
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
			return (game.getUserColour() !== null && game.isInProgress());
		}).bind(this));
	}
	
	User.prototype._createGame = function(gameDetails) {
		return new Game(this, this._server, gameDetails);
	}
	
	User.prototype._addGame = function(game) {
		this._games.push(game);
		
		game.Rematch.addHandler(this, function(game) {
			this._addGame(game);
		});
	}
	
	User.prototype.getGame = function(id) {
		var promiseId = "/game/" + id;
		
		if(promiseId in this._promises) {
			return this._promises[promiseId];
		}
		
		else {
			var promise = new Promise();
			
			promise.then(null, null, (function() {
				delete this._promises[promiseId];
			}).bind(this));
			
			this._games.some(function(game) {
				if(game.getId() === id) {
					promise.resolve(game);
					
					return true;
				}
			});
			
			if(!promise.isResolved()) {
				this._server.send("/request/game", id);
				this._promises[promiseId] = promise;
				
				setTimeout(function() {
					promise.fail();
				}, 1000);
			}
			
			return promise;
		}
	}
	
	User.prototype.getGames = function() {
		var promiseId = "/games";
		var promise;
		
		if(promiseId in this._promises) {
			promise = this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
		
			this._server.send("/request/games");
		}
		
		return promise;
	}
	
	User.prototype._handleServerEvents = function() {
		this._server.ConnectionOpened.addHandler(this, function() {
			this._resetSession();
		});
	}
	
	User.prototype._resetSession = function() {
		this._promises = {};
		this._games = [];
	}
	
	User.prototype._subscribeToServerMessages = function() {
		this._server.subscribe("/user/login/success", (function(userDetails) {
			this._loadDetails(userDetails);
			
			var promiseId = "/login";
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve();
			}
			
			this.LoggedIn.fire();
		}).bind(this));
		
		this._server.subscribe("/user/login/failure", (function(reason) {
			this._promises["/login"].fail(reason);
		}).bind(this));
		
		this._server.subscribe("/user/logout", (function() {
			this._logout();
			
			var promiseId = "/logout";
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve();
			}
		}).bind(this));
		
		this._server.subscribe("/user/register/success", (function() {
			this._promises["/register"].resolve();
		}).bind(this));
		
		this._server.subscribe("/user/register/failure", (function(reason) {
			this._promises["/register"].fail(reason);
		}).bind(this));
		
		this._server.subscribe("/user/replaced", (function(data) {
			this.Replaced.fire();
		}).bind(this));
		
		this._server.subscribe("/games", (function(games) {
			var promiseId = "/games";
			
			games.forEach((function(gameDetails) {
				this._addGame(this._createGame(gameDetails));
			}).bind(this));
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve(this._games);
			}
		}).bind(this));
		
		this._server.subscribe("/game", (function(gameDetails) {
			var game = this._createGame(gameDetails);
			var promiseId = "/game/" + game.getId();
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve(game);
			}
			
			this._addGame(game);
			this.NewGame.fire(game);
		}).bind(this));
		
		this._server.subscribe("/game/not_found", (function(id) {
			var promiseId = "/game/" + id;
			
			if(promiseId in this._promises) {
				this._promises[promiseId].fail();
			}
		}).bind(this));
		
		this._server.subscribe("/user", (function(userDetails) {
			this._loadDetails(userDetails);
			
			var promiseId = "/details";
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve();
			}
		}).bind(this));
		
		this._server.subscribe("/current_challenge", (function(challengeDetails) {
			this._currentChallenge = challengeDetails;
			this.ChallengeCreated.fire();
		}).bind(this));
		
		this._server.subscribe("/current_challenge/expired", (function() {
			this._currentChallenge = null;
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
		this._prefs = userDetails.prefs;
	}
	
	return User;
});
define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	var Promise = require("lib/Promise");
	var glicko2 = require("jsonchess/glicko2");
	var gameRestoration = require("jsonchess/gameRestoration");
	var time = require("lib/time");
	
	var GAME_BACKUP_MAX_AGE = 1000 * 60 * 60 * 24;
	
	function User(server, db) {
		this._id = null;
		this._games = [];
		this._promises = {};
		
		this._server = server;
		this._db = db;
		
		if(!this._db.get("gameBackups")) {
			this._db.set("gameBackups", {});
		}
		
		this._cleanupOldGameBackups();
		this._markGameBackupsForCleanup();
		
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = glicko2.defaults.RATING;
		this._currentChallenge = null;
		this._lastChallengeOptions = null;
		
		this._prefs = {
			premove: null,
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
	
	User.prototype.getGameBackups = function() {
		return this._db.get("gameBackups");
	}
	
	User.prototype._cleanupOldGameBackups = function() {
		this._filterGameBackups(function(backup) {
			return (backup.expiryTime === null || time() < backup.expiryTime);
		});
	}
	
	User.prototype._markGameBackupsForCleanup = function() {
		this._filterGameBackups(function(backup) {
			if(backup.expiryTime === null) {
				backup.expiryTime = time() + GAME_BACKUP_MAX_AGE;
			}
		});
	}
	
	User.prototype._filterGameBackups = function(callback) {
		var backups = this._db.get("gameBackups");
		
		for(var id in backups) {
			if(callback(backups[id]) === false) {
				delete backups[id];
			}
		}
		
		this._db.set("gameBackups", backups);
	}
	
	User.prototype._modifyGameBackup = function(id, modifications) {
		var backups = this._db.get("gameBackups");
		
		if(id in backups) {
			for(var p in modifications) {
				backups[id][p] = modifications[p];
			}
		}
		
		this._db.set("gameBackups", backups);
	}
	
	User.prototype.restoreGameFromBackup = function(backup) {
		var promiseId = "/game/restore/" + backup.gameDetails.id;
		var promise;
		
		if(promiseId in this._promises) {
			promise = this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
			
			promise.then(null, null, (function() {
				delete this._promises[promiseId];
			}).bind(this));
			
			this._server.send("/game/restore", {
				gameDetails: backup.gameDetails,
				playingAs: backup.playingAs
			});
		}
		
		return promise;
	}
	
	User.prototype.cancelGameRestoration = function(id) {
		var promiseId = "/game/restore/cancel/" + id;
		var promise;
		
		if(promiseId in this._promises) {
			promise = this._promises[promiseId];
		}
		
		else {
			promise = this._promises[promiseId] = new Promise();
			
			promise.then(null, null, (function() {
				delete this._promises[promiseId];
			}).bind(this));
			
			this._server.send("/game/restore/cancel", id);
		}
		
		return promise;
	}
	
	User.prototype._saveGameBackup = function(game) {
		var gameDetails = game.getBackupDetails();
		var id = gameDetails.id;
		var backups = this._db.get("gameBackups");
		var backup;
		
		if(id in backups) {
			backup = backups[id];
			backup.gameDetails = gameDetails;
			backup.expiryTime = null;
		}
		
		else {
			backup = {
				expiryTime: null,
				restorationRequestSubmitted: false,
				gameDetails: gameDetails,
				opponent: game.getPlayer(game.getUserColour().opposite).username,
				timingDescription: game.getTimingStyle().getDescription(),
				playingAs: game.getUserColour().fenString
			};
		}
		
		backups[id] = backup;
		
		this._db.set("gameBackups", backups);
	}
	
	User.prototype._removeGameBackup = function(game) {
		var backups = this._db.get("gameBackups");
		
		delete backups[game.getId()];
		
		this._db.set("gameBackups", backups);
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
		
		if(game.userIsPlaying()) {
			game.Move.addHandler(this, function() {
				if(game.getHistory().length >= gameRestoration.MIN_MOVES) {
					this._saveGameBackup(game);
				}
			});
			
			game.GameOver.addHandler(this, function() {
				this._removeGameBackup(game);
			});
		}
		
		game.Rematch.addHandler(this, function(game) {
			this._addGame(game);
		});
		
		return game;
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
			var game = this._games.filter(function(existingGame) {
				return (existingGame.getId() === gameDetails.id);
			})[0] || this._addGame(this._createGame(gameDetails));
						
			var promiseId = "/game/" + game.getId();
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve(game);
			}
		}).bind(this));
		
		this._server.subscribe("/challenge/accepted", (function(gameDetails) {
			this.NewGame.fire(this._addGame(this._createGame(gameDetails)));
		}).bind(this));
		
		this._server.subscribe("/game/restore/success", (function(gameDetails) {
			var game = this._addGame(this._createGame(gameDetails));
			var id = game.getId();
			var promiseId = "/game/restore/" + id;
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve(game);
			}
			
			this.NewGame.fire(game);
		}).bind(this));
		
		this._server.subscribe("/game/restore/canceled", (function(id) {
			var promiseId = "/game/restore/cancel/" + id;
			
			if(promiseId in this._promises) {
				this._promises[promiseId].resolve();
			}
		}).bind(this));
		
		this._server.subscribe("/game/restore/pending", (function(id) {
			var promiseId = "/game/restore/cancel/" + id;
			
			if(promiseId in this._promises) {
				//this._promises[promiseId].progress();
				/*
				TODO implement progress in Promise so that the ui can add a progress handler
				and update the 'restorationRequestSubmitted' property in the template
				*/
			}
			
			this._modifyGameBackup(id, {
				restorationRequestSubmitted: true
			});
		}).bind(this));
		
		this._server.subscribe("/game/restore/failure", (function(data) {
			var promiseId = "/game/restore/" + data.id;
			
			if(promiseId in this._promises) {
				this._promises[promiseId].fail(data.reason);
			}
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
define(function(require) {
	var Game = require("./Game");
	var Event = require("lib/Event");
	var Promisor = require("lib/Promisor");
	var glicko2 = require("jsonchess/glicko2");
	var gameRestoration = require("jsonchess/gameRestoration");
	var time = require("lib/time");
	
	var GAME_BACKUP_MAX_AGE = 1000 * 60 * 60 * 24;
	
	function User(server, db) {
		this._id = null;
		this._games = [];
		this._promisor = new Promisor(this);
		
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
		return this._promisor.getPersistent("/details", function() {
			this._server.send("/request/user");
		});
	}
	
	User.prototype.register = function(username, password) {
		return this._promisor.get("/register", function() {
			this._server.send("/user/register", {
				username: username,
				password: password
			});
		});
	}
	
	User.prototype.login = function(username, password) {
		return this._promisor.get("/login", function() {
			this._server.send("/user/login", {
				username: username,
				password: password
			});
		});
	}
	
	User.prototype._login = function(userDetails) {
		this._loadDetails(userDetails);
		this._promisor.remove("/games");
	}
	
	User.prototype.logout = function() {
		return this._promisor.get("/logout", function() {
			this._server.send("/user/logout");
		});
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
	
	User.prototype._saveGameBackup = function(game) {
		var gameDetails = game.getBackupDetails();
		var id = gameDetails.id;
		var backups = this._db.get("gameBackups");
		var backup;
		var playingAs = game.getUserColour();
		
		if(id in backups) {
			backup = backups[id];
			backup.gameDetails = gameDetails;
			backup.expiryTime = null;
		}
		
		else {
			backup = {
				expiryTime: null,
				gameDetails: gameDetails,
				opponent: game.getPlayer(playingAs.opposite),
				timingDescription: game.getTimingStyle().getDescription(),
				playingAs: playingAs.fenString
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
		return this._promisor.get("/game/" + id, function(promise) {
			this._games.some(function(game) {
				if(game.getId() === id) {
					promise.resolve(game);
					
					return true;
				}
			});
			
			if(!promise.isResolved()) {
				this._server.send("/request/game", id);
				
				setTimeout(function() {
					promise.fail();
				}, 1000);
			}
		});
	}
	
	User.prototype.getGames = function() {
		return this._promisor.getPersistent("/games", function() {
			this._server.send("/request/games");
		});
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
			this._login(userDetails);
			this._promisor.resolve("/login");
			this.LoggedIn.fire();
		}).bind(this));
		
		this._server.subscribe("/user/login/failure", (function(reason) {
			this._promisor.fail("/login", reason);
		}).bind(this));
		
		this._server.subscribe("/user/logout", (function() {
			this._logout();
			this._promisor.resolve("/logout");
		}).bind(this));
		
		this._server.subscribe("/user/register/success", (function() {
			this._promisor.resolve("/register");
		}).bind(this));
		
		this._server.subscribe("/user/register/failure", (function(reason) {
			this._promisor.resolve("/register", reason);
		}).bind(this));
		
		this._server.subscribe("/games", (function(games) {
			games.forEach((function(gameDetails) {
				this._addGame(this._createGame(gameDetails));
			}).bind(this));
			
			this._promisor.resolve("/games", this._games);
		}).bind(this));
		
		this._server.subscribe("/game", (function(gameDetails) {
			var game = this._games.filter(function(existingGame) {
				return (existingGame.getId() === gameDetails.id);
			})[0] || this._addGame(this._createGame(gameDetails));
						
			this._promisor.resolve("/game/" + game.getId(), game);
		}).bind(this));
		
		this._server.subscribe("/challenge/accepted", (function(gameDetails) {
			this.NewGame.fire(this._addGame(this._createGame(gameDetails)));
		}).bind(this));
		
		this._server.subscribe("/game/not_found", (function(id) {
			this._promisor.fail("/game/" + id);
		}).bind(this));
		
		this._server.subscribe("/user", (function(userDetails) {
			this._loadDetails(userDetails);
			this._promisor.resolve("/details");
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
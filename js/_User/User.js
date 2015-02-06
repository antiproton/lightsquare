define(function(require) {
	var Event = require("js/Event");
	var time = require("js/time");
	var Promisor = require("js/Promisor");
	var glicko2 = require("jsonchess/glicko2");
	var gameRestoration = require("jsonchess/gameRestoration");
	var Game = require("lightsquare/Game");
	var RestorationRequest = require("lightsquare/RestorationRequest");
	var locales = require("lightsquare/locales");
	var i18n = require("i18n/i18n");
	var GameBackups = require("./_GameBackups");
	var Games = require("./_Games");
	
	function User(server, db, locale) {
		this._playerId = null;
		this._promisor = new Promisor(this);
		this._server = server;
		this._db = db;
		
		this.LoggedIn = new Event();
		this.LoggedOut = new Event();
		this.GameRestored = new Event();
		this.PrefsChanged = new Event();
		this.SeekCreated = new Event();
		this.SeekExpired = new Event();
		this.SeekMatched = new Event();
		
		this._locale = "en";
		this._setPreferredLocale(locale);
		
		this._gameBackups = new GameBackups(this._db);
		this._gameBackups.cleanupOldBackups();
		this._gameBackups.markForCleanup();
		
		this._games = new Games(this, this._server, this._gameBackups);
		this._handleGamesEvents();
		
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = glicko2.defaults.RATING;
		this._currentSeek = null;
		this._lastSeekOptions = null;
		
		this._prefs = {
			premove: null,
			alwaysQueen: null,
			sound: null,
			pieceStyle: null,
			boardSize: null,
			boardStyle: null
		};
		
		this._handleServerEvents();
		this._subscribeToServerMessages();
	}
	
	User.prototype.getGameBackups = function() {
		return this._gameBackups.getBackups();
	}
	
	User.prototype.getLocale = function() {
		return this._locale;
	}
	
	User.prototype.setLocale = function(locale) {
		this._locale = locale;
		this._db.set("locale", locale);
	}
	
	User.prototype.getLocaleDictionary = function() {
		return locales[this._locale];
	}
	
	User.prototype._setPreferredLocale = function(locale) {
		if(locale) {
			this.setLocale(locale);
		}
		
		else {
			storedLocale = this._db.get("locale");
			
			if(storedLocale) {
				this._locale = storedLocale;
			}
		}
	}
	
	User.prototype.__ = function(string, replacements) {
		return i18n.__(locales[this._locale], string, replacements);
	}
	
	User.prototype.__n = function(singularVersion, count, replacements) {
		return i18n.__n(locales[this._locale], singularVersion, count, replacements);
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
		this.LoggedIn.fire();
	}
	
	User.prototype.logout = function() {
		return this._promisor.get("/logout", function() {
			this._server.send("/user/logout");
		});
	}
	
	User.prototype._logout = function(newPlayerId) {
		this._playerId = newPlayerId;
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._rating = glicko2.defaults.RATING;
		this.LoggedOut.fire();
	}
	
	User.prototype.getPendingRestorations = function() {
		return this._promisor.get("/restoration_requests", function() {
			this._server.send("/request/restoration_requests");
		});
	}
	
	User.prototype.createRestorationRequest = function(backup) {
		var request = new RestorationRequest(this, this._server, backup);
		
		request.GameRestored.addHandler(function(game) {
			this._gameBackups.remove(request.getId());
			this.GameRestored.fire(this._addGame(game));
		}, this);
		
		return request;
	}
	
	User.prototype.getUsername = function() {
		return this._username;
	}
	
	User.prototype.getPlayerId = function() {
		return this._playerId;
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
	
	User.prototype.updatePref = function(pref, value) {
		var prefs = {};
		
		prefs[pref] = value;
		
		this.updatePrefs(prefs);
	}
	
	User.prototype.getRating = function() {
		return this._rating;
	}
	
	User.prototype.isLoggedIn = function() {
		return this._isLoggedIn;
	}
	
	User.prototype.getGame = function(id) {
		return this._games.getGame(id);
	}
	
	User.prototype.getGames = function() {
		return this._games.getGames();
	}
	
	User.prototype.seekGame = function(options) {
		return this._games.seek(options);
	}
	
	User.prototype.cancelSeek = function() {
		this._games.cancelSeek();
	}
	
	User.prototype.acceptSeek = function(id) {
		this._games.acceptSeek(id);
	}
	
	User.prototype.getCurrentSeek = function() {
		return this._games.currentSeek;
	}
	
	User.prototype._handleGamesEvents = function() {
		this._games.SeekCreated.addHandler(function(seekDetails) {
			this.SeekCreated.fire(seekDetails);
		}, this);
		
		this._games.SeekMatched.addHandler(function(game) {
			this.SeekMatched.fire(game);
		}, this);
		
		this._games.SeekExpired.addHandler(function() {
			this.SeekExpired.fire();
		}, this);
	}
	
	User.prototype.getLastSeekOptions = function() {
		return this._lastSeekOptions;
	}
	
	User.prototype.hasGamesInProgress = function() {
		return this._games.getGames().some((function(game) {
			return (game.getUserColour() !== null && game.isInProgress);
		}).bind(this));
	}
	
	User.prototype.createTournament = function(options) {
		return this._promisor.get("/tournament/new", function(promise) {
			this._server.send("/tournament/new", options);
		});
	}
	
	User.prototype._handleServerEvents = function() {
		this._server.Connected.addHandler(function() {
			this._resetSession();
		}, this);
	}
	
	User.prototype._resetSession = function() {
		this._promisor = new Promisor(this);
	}
	
	User.prototype._subscribeToServerMessages = function() {
		var subscriptions = {
			"/user/login/success": function(userDetails) {
				this._login(userDetails);
				this._promisor.resolve("/login");
			},
			
			"/user/login/failure": function(reason) {
				this._promisor.fail("/login", reason);
			},
			
			"/user/logout": function(newPlayerId) {
				this._logout(newPlayerId);
				this._promisor.resolve("/logout");
			},
			
			"/user/register/success": function(loginDetails) {
				if(loginDetails) {
					this._login(loginDetails);
				}
				
				this._promisor.resolve("/register", !!loginDetails);
			},
			
			"/user/register/failure": function(reason) {
				this._promisor.fail("/register", reason);
			},

			"/tournament/new/success": function(details) {
				this._promisor.resolve("/tourament/new", this._addTournament(this._createTournament(details)));
			},
			
			"/user": function(userDetails) {
				this._loadDetails(userDetails);
				this._promisor.resolve("/details");
			},
			
			"/restoration_requests": function(ids) {
				this._promisor.resolve("/restoration_requests", ids);
			}
		};
		
		for(var topic in subscriptions) {
			this._server.subscribe(topic, subscriptions[topic].bind(this));
		}
	}
	
	User.prototype._loadDetails = function(userDetails) {
		this._playerId = userDetails.playerId;
		this._username = userDetails.username;
		this._isLoggedIn = userDetails.isLoggedIn;
		this._rating = userDetails.rating;
		this._currentSeek = userDetails.currentSeek;
		this._lastSeekOptions = userDetails.lastSeekOptions;
		this._prefs = userDetails.prefs;
	}
	
	return User;
});
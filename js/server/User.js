define(function(require) {
	var Publisher = require("lib/Publisher");
	var id = require("lib/id");
	var Event = require("lib/Event");
	var db = require("lib/db/db");
	
	function User(user) {
		this._id = id();
		this._user = user;
		this._session = user.getSession();
		this._username = "Anonymous";
		this._password = null;
		this._isLoggedIn = false;
		this._publisher = new Publisher();
		this._gamesPlayedAsWhite = 0;
		this._gamesPlayedAsBlack = 0;
		
		this.Connected = new Event(this);
		this.Disconnected = new Event(this);
		
		this._user.Disconnected.addHandler(this, function() {
			this.Disconnected.fire();
		});
		
		this._user.Connected.addHandler(this, function() {
			this.Connected.fire();
		});
		
		if(this._session.user) {
			this._loadJSON(this._session.user);
			this._isLoggedIn = this._session.isLoggedIn();
		}
		
		this._session.user = this;
		
		this._subscribeToUserMessages();
	}
	
	User.prototype.getId = function() {
		return this._id;
	}
	
	User.prototype.toString = function() {
		return this._id;
	}
	
	User.prototype._login = function(username, password) {
		db.query("select * from users where username = ? and password = ?", [username, password], function(rows) {
			if(rows.length === 1) {
				this._loadJSON(rows[0]);
				this._isLoggedIn = true;
				this._user.send("/user/login/success");
			}
			
			else {
				this._user.send("/user/login/failure");
			}
		});
	}
	
	User.prototype._logout = function() {
		if(this._isLoggedIn) {
			this._isLoggedIn = false;
			this._username = "Anonymous";
			this._user.send("/user/logout");
		}
	}
	
	User.prototype._register = function(username, password) {
		db.query("select username from users where username = ?", [username], function(rows) {
			if(rows.length === 0) {
				db.insert("users", this);
				
				this._user.send("/user/register/success", this);
			}
			
			else {
				this._user.send("/user/register/failure");
			}
		});
	}
	
	User.prototype._save = function() {
		db.update("users", this, {
			username: this._username
		});
	}
	
	User.prototype.sendCurrentTables = function(tables) {
		if(!this._session.currentTables) {
			this._session.currentTables = [];
			
			var table;
			
			for(var id in tables) {
				table = tables[id];
				
				if(this._isAtTable(table)) {
					this._session.currentTables.push(table);
				}
			}
		}
		
		this._user.send("/tables", this._session.currentTables);
	}
	
	User.prototype.subscribe = function(url, callback) {
		this._publisher.subscribe(url, callback);
	}
	
	User.prototype.unsubscribe = function(url, callback) {
		this._publisher.unsubscribe(url, callback);
	}
	
	User.prototype.send = function(url, data) {
		this._user.send(url, data);
	}
	
	User.prototype._isAtTable = function(table) {
		return (table.userIsSeated(this) || table.userIsWatching(this));
	}
	
	User.prototype.getUsername = function() {
		return this._username;
	}
	
	User.prototype.isLoggedIn = function() {
		return this._isLoggedIn;
	}
	
	User.prototype.getGamesAsWhiteRatio = function() {
		Math.max(1, this._gamesPlayedAsWhite) / Math.max(1, this._gamesPlayedAsBlack);
	}
	
	User.prototype._subscribeToUserMessages = function() {
		this._user.subscribe("*", (function(url, data) {
			this._publisher.publish(url, data);
		}).bind(this));
		
		this._user.subscribe("/user/login", function(data) {
			this._login(data.username, data.password);
		});
		
		this._user.subscribe("/user/logout", function() {
			this._logout();
		});
		
		this._user.subscribe("/user/register", function(data) {
			this._register(data.username, data.password);
		});
	}
	
	User.prototype.toJSON = function() {
		return {
			username: this._username,
			gamesPlayedAsWhite: this._gamesPlayedAsWhite,
			gamesPlayedAsBlack: this._gamesPlayedAsBlack
		};
	}
	
	User.prototype._loadJSON = function(data) {
		data = (data.toJSON instanceof Function ? data.toJSON() : data);
		
		this._username = data.username;
		this._gamesPlayedAsWhite = data.gamesPlayedAsWhite;
		this._gamesPlayedAsBlack = data.gamesPlayedAsBlack;
	}
	
	return User;
});
define(function(require) {
	var Promisor = require("js/Promisor");
	
	function Games(user, server, gameBackups) {
		this._promisor = new Promisor(this);
		this._user = user;
		this._server = server;
		this._gameBackups = gameBackups;
		this._games = [];
		this.currentSeek = null;
		
		this.SeekCreated = new Event();
		this.SeekExpired = new Event();
		this.SeekMatched = new Event();
		
		this._server.Connected.addHandler(function() {
			this._games = [];
		}, this);
		
		this._user.LoggedOut.addHandler(function() {
			this._games = [];
		}, this);
	}
	
	Games.prototype.seek = function(options) {
		return this._promisor.get("/seek", function() {
			this._server.send("/seek", options);
		});
	}
	
	Games.prototype.cancelSeek = function() {
		this._server.send("/seek/cancel");
	}
	
	Games.prototype.acceptSeek = function(id) {
		this._server.send("/seek/accept", id);
	}
	
	Games.prototype._createGame = function(gameDetails) {
		return new Game(this, this._server, gameDetails);
	}
	
	Games.prototype._addGame = function(game) {
		this._games.push(game);
		
		if(game.userIsPlaying()) {
			game.Move.addHandler(function() {
				if(game.history.length >= gameRestoration.MIN_MOVES) {
					this._gameBackups.save(game);
				}
			}, this);
			
			game.GameOver.addHandler(function() {
				this._gameBackups.remove(game.id);
			}, this);
		}
		
		game.Rematch.addHandler(function(game) {
			this._addGame(game);
		}, this);
		
		return game;
	}
	
	Games.prototype.getGame = function(id) {
		return this._promisor.get("/game/" + id, function(promise) {
			this._games.some(function(game) {
				if(game.id === id) {
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
	
	Games.prototype.getGames = function() {
		return this._promisor.getPersistent("/games", function() {
			this._server.send("/request/games");
		});
	}
	
	Games.prototype._subscribeToServerMessages = function() {
		var subscriptions = {
			"/games": function(games) {
				games.forEach((function(gameDetails) {
					this._addGame(this._createGame(gameDetails));
				}).bind(this));
				
				this._promisor.resolve("/games", this._games);
			},
			
			"/game": function(gameDetails) {
				var game = this._games.filter(function(existingGame) {
					return (existingGame.id === gameDetails.id);
				})[0] || this._addGame(this._createGame(gameDetails));
							
				this._promisor.resolve("/game/" + game.id, game);
			},
			
			"/seek/matched": function(gameDetails) {
				var game = this._addGame(this._createGame(gameDetails));
				
				this.currentSeek = null;
				this.SeekMatched.fire(game);
				this._promisor.resolve("/seek", game);
			},
			
			"/game/not_found": function(id) {
				this._promisor.fail("/game/" + id);
			},
			
			"/seek/waiting": function(seekDetails) {
				this.currentSeek = seekDetails;
				this._promisor.progress("/seek", seekDetails);
				this.SeekCreated.fire(seekDetails);
			},
			
			"/seek/error": function(error) {
				this._promisor.fail("/seek", error);
			},
			
			"/seek/expired": function() {
				this.currentSeek = null;
				this.SeekExpired.fire();
				this._promisor.resolve("/seek", null);
			}
		};
		
		for(var topic in subscriptions) {
			this._server.subscribe(topic, subscriptions[topic].bind(this));
		}
	}
	
	return Games;
});
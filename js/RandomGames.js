define(function(require) {
	var Event = require("lib/Event");
	var Promisor = require("lib/Promisor");
	
	function RandomGames(server) {
		this._server = server;
		this._games = {};
		
		this.NewGame = new Event(this);
		this.GameOver = new Event(this);
		this.Move = new Event(this);
		
		this._subscribeToServerMessages();
	}
	
	RandomGames.prototype.stopUpdating = function() {
		this._server.send("/random_games/unsubscribe");
		this._promisor.remove("/games");
	}
	
	RandomGames.prototype.getGames = function() {
		return this._promisor.getPersistent("/games", function() {
			this._server.send("/random_games/subscribe");
		});
	}
	
	RandomGames.prototype._subscribeToServerMessages = function() {
		this._server.subscribe("/random_game/new", (function(gameDetails) {
			this._games[gameDetails.id] = gameDetails;
			this.NewGame.fire(gameDetails);
		}).bind(this));
		
		this._server.subscribe("/random_game/game_over", (function(id) {
			delete this._games[id];
			
			this.GameOver.fire(id);
		}).bind(this));
		
		this._server.subscribe("/random_game/move", (function(data) {
			if(data.game in this._games) {
				this._games[data.game].history.push(data.move);
				
				this.Move.fire({
					gameId: data.gameId,
					move: data.move
				});
			}
		}).bind(this));
		
		this._server.subscribe("/random_games", (function(games) {
			games.forEach((function(gameDetails) {
				this._games[gameDetails.id] = gameDetails;
			}).bind(this));
			
			this._promisor.resolve("/games", this._games);
		}).bind(this));
	}
	
	return RandomGames;
});
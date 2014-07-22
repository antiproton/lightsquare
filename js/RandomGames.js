define(function(require) {
	var Event = require("lib/Event");
	var Promisor = require("lib/Promisor");
	
	function RandomGames(server) {
		this._server = server;
		this._games = {};
		this._promisor = new Promisor(this);
		
		this.NewGame = new Event();
		this.GameOver = new Event();
		this.Move = new Event();
		
		this._subscribeToServerMessages();
	}
	
	RandomGames.prototype.startUpdating = function() {
		this._server.send("/random_games/subscribe");
	}
	
	RandomGames.prototype.stopUpdating = function() {
		this._server.send("/random_games/unsubscribe");
		this._promisor.remove("/games");
	}
	
	RandomGames.prototype.getGames = function() {
		return this._promisor.getPersistent("/games");
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
			var id = data.gameId;
			var move = data.move;
			
			if(id in this._games) {
				this._games[id].history.push(move);
				
				this.Move.fire({
					gameId: id,
					move: move
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
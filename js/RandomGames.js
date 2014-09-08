define(function(require) {
	var Event = require("js/Event");
	
	function RandomGames(server) {
		this._server = server;
		
		this.Update = new Event();
		this.GameOver = new Event();
		
		this._subscribeToServerMessages();
	}
	
	RandomGames.prototype.startUpdating = function() {
		this._server.getConnection().then((function() {
			this._server.send("/random_games/subscribe");
		}).bind(this));
	}
	
	RandomGames.prototype.stopUpdating = function() {
		this._server.send("/random_games/unsubscribe");
	}
	
	RandomGames.prototype._subscribeToServerMessages = function() {
		this._server.subscribe("/random_game", (function(gameDetails) {
			this.Update.fire(gameDetails);
		}).bind(this));
		
		this._server.subscribe("/random_game/game_over", (function(id) {
			this.GameOver.fire(id);
		}).bind(this));
	}
	
	return RandomGames;
});
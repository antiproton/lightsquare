define(function(require) {
	require("css!./current_games.css");
	var html = require("file!./current_games.html");
	var Ractive = require("lib/dom/Ractive");
	var Move = require("jsonchess/Move");
	
	function CurrentGames(gamesList, parent) {
		this._gamesList = gamesList;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				games: {}
			}
		});
		
		this._gamesList.NewGame.addHandler(function(gameDetails) {
			var position;
			
			if(gameDetails.history.length > 0) {
				position = Move.fromJSON(gameDetails.history[gameDetails.history.length - 1]).getPosition();
			}
			
			else {
				position = new Position();
			}
			
			this._template.set("games." + id + ".board", position.getBoardArray());
			this._template.set("games." + id + ".last_move", null);
		}, this);
		
		this._gamesList.Move.addHandler(function(data) {
			var id = data.gameId;
			var move = Move.fromJSON(data.move);
			
			this._template.set("games." + id + ".board", move.getPosition().getBoardArray());
			this._template.set("games." + id + ".last_move", move);
		}, this);
		
		this._gamesList.GameOver.addHandler(function(id) {
			this._template.set("games." + id, undefined);
		}, this);
	}
	
	CurrentGames.prototype.startUpdating = function() {
		this._gamesList.startUpdating();
		
		this._gamesList.getGames().then((function(games) {
			this._template.set("games", games);
		}).bind(this));
	}
	
	CurrentGames.prototype.stopUpdating = function() {
		this._gamesList.stopUpdating();
	}
	
	return CurrentGames;
});
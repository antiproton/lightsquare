define(function(require) {
	require("css!./current_games.css");
	var html = require("file!./current_games.html");
	var Ractive = require("lib/dom/Ractive");
	var Move = require("jsonchess/Move");
	var Position = require("chess/Position");
	
	function CurrentGames(gamesList, parent) {
		this._gamesList = gamesList;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				squareSize: 30,
				pieceUrl: require.toUrl("./piece_sprite.png"),
				getSquareTopOffset: function(squareNo) {
					
				},
				getSquareLeftOffset: function(squareNo) {
					
				},
				getSquareColour: function(squareNo) {
					
				},
				getPieceOffset: function(piece) {
					
				},
				games: {}
			}
		});
		
		this._gamesList.NewGame.addHandler(function(gameDetails) {
			this._addGame(gameDetails);
		}, this);
		
		this._gamesList.Move.addHandler(function(data) {
			var id = data.gameId;
			var move = Move.fromJSON(data.move);
			
			this._template.set("games." + id + ".board", move.getPositionAfter().getBoardArray());
			this._template.set("games." + id + ".last_move", move);
		}, this);
		
		this._gamesList.GameOver.addHandler(function(id) {
			this._template.set("games." + id, undefined);
		}, this);
	}
	
	CurrentGames.prototype.startUpdating = function() {
		this._gamesList.startUpdating();
		
		this._gamesList.getGames().then((function(games) {
			games.forEach((function(gameDetails) {
				this._addGame(gameDetails);
			}).bind(this));
		}).bind(this));
	}
	
	CurrentGames.prototype.stopUpdating = function() {
		this._gamesList.stopUpdating();
	}
	
	CurrentGames.prototype._addGame = function(gameDetails) {
		var id = gameDetails.id;
		var position;
		
		if(gameDetails.history.length > 0) {
			position = Move.fromJSON(gameDetails.history[gameDetails.history.length - 1]).getPositionAfter();
		}
		
		else {
			position = new Position();
		}
		
		this._template.set("games." + id + ".board", position.getBoardArray());
		this._template.set("games." + id + ".last_move", null);
	}
	
	return CurrentGames;
});
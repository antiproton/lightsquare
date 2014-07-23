define(function(require) {
	require("css!./current_games.css");
	var html = require("file!./current_games.html");
	var Ractive = require("lib/dom/Ractive");
	var Move = require("jsonchess/Move");
	var Position = require("chess/Position");
	var Square = require("chess/Square");
	
	function CurrentGames(gamesList, parent) {
		this._gamesList = gamesList;
		
		var squareSize = 45;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				squareSize: squareSize,
				pieceUrl: require.toUrl("./piece_sprite.png"),
				getSquareY: function(squareNo) {
					return Square.fromSquareNo(squareNo).coords.y;
				},
				getSquareX: function(squareNo) {
					return Square.fromSquareNo(squareNo).coords.x;
				},
				getSquareColour: function(squareNo) {
					var coords = Square.fromSquareNo(squareNo).coords;
					
					return (coords.x % 2 === coords.y % 2 ? 'w' : 'b');
				},
				getPieceOffset: function(piece) {
					return (piece ? -"PNBRQKpnbrqk".indexOf(piece) : 1) * squareSize;
				},
				getAbsolutePath: function(path) {
					return require.toUrl(path);
				},
				games: {}
			}
		});
		
		this._gamesList.Update.addHandler(function(gameDetails) {
			this._updateGame(gameDetails);
		}, this);
		
		this._gamesList.GameOver.addHandler(function(id) {
			this._template.set("games." + id, undefined);
		}, this);
	}
	
	CurrentGames.prototype.startUpdating = function() {
		this._gamesList.startUpdating();
	}
	
	CurrentGames.prototype.stopUpdating = function() {
		this._gamesList.stopUpdating();
	}
	
	CurrentGames.prototype._updateGame = function(gameDetails) {
		var id = gameDetails.id;
		
		this._template.set("games." + id + ".board", new Position(gameDetails.fen).getBoardArray());
		this._template.set("games." + id + ".lastMove", gameDetails.lastMove);
	}
	
	return CurrentGames;
});
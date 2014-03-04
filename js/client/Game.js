define(function(require) {
	var ChessGame = require("chess/Game");
	var Piece = require("chess/Piece");
	var ChessMove = require("chess/Move");
	var Move = require("common/Move");

	function Game(server, game) {
		this.PromotionPieceNeeded = new Event(this);
		
		this._server = server;
		
		this._id = game.id;
		
		this._players = [];
		this._players[Piece.WHITE] = game.white;
		this._players[Piece.BLACK] = game.black;
		
		this._isRated = game.isRated;
		
		this._history = [];
		
		game.history.forEach((function(move) {
			this._history.push(Move.fromJSON(move));
		}).bind(this));
		
		this._game = new ChessGame();
	}

	Game.prototype.move = function(from, to, promoteTo) {
		var move = new ChessMove(this._game.getPosition(), from, to, promoteTo);
		
		if(move.isPromotion() && promoteTo === undefined) {
			this.PromotionPieceNeeded.fire();
		}
		
		else {
			this._history.push(move);
			
			this._server.send("/game/" + this._id + "/move", {
				from: from,
				to: to,
				promoteTo: promoteTo
			});
		}
	}
	
	return Game;
});
define(function(require) {
	var ChessGame=require("chess/Game");
	var Piece=require("chess/Piece");
	var Move=require("chess/Move");

	function Game(server, details) {
		this._id=details.id;
		
		this._players=[];
		this._players[Piece.WHITE]=details.white;
		this._players[Piece.BLACK]=details.black;
		
		this._rated=details.rated;
		
		this._game=new ChessGame();
	}

	Game.prototype.move=function(from, to) {

		var move=new Move(this._game.getPosition(), from, to, QUEEN);
	}
});
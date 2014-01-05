define(function(require) {
	var ChessGame=require("chess/Game");

	function Game(id, socket) {
		this._id=id;
		this._game=new ChessGame();
	}

	Game.prototype.move=function(from, to) {

		var move=new Move(this._game.getPosition(), from, to, QUEEN);
	}
});
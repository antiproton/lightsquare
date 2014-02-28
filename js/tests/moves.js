define(function(require) {
	global = window || global;
	
	var Game = require("chess/Game");
	var Piece = require("chess/Piece");
	var Chess = require("chess/Chess");
	
	var game = new Game();
	
	function move(from, to, promote) {
		console.log(game.move(from, to, promote).getLabel().toString());
		console.log(game.getPosition().getFen());
	}
	
	for(var i=0; i<64; i++) {
		global[Chess.algebraicFromSquare(i)]=i;
	}
	
	move(e2, e4);
	move(g8, f6);
	move(b1, c3);
	move(d7, d5);
	move(f1, c4);
	move(b8, c6);
	move(d1, f3);
	move(f6, h5);
	move(f3, f7);
	move(e8, d7);
	
	console.log(game.getPosition().countLegalMoves(Piece.WHITE));
});
define(function(require) {
	require("lib/dom/ready!");
	var Server = require("lib/websocket-client/Server");
	var $ = require("lib/dom/byId");
	var TabControl = require("lib/widgets/TabControl/TabControl");
	var Game = require("chess/Game");
	var Piece = require("chess/Piece");
	var Chess = require("chess/Chess");
	
	server = new Server("ws://chess:8080");
	server.connect();
	
	var game = new Game();
	
	function move(from, to, promote) {
		console.log(game.move(from, to, promote).getLabel().toString());
		console.log(game.getPosition().getFen());
	}
	
	for(var i=0; i<64; i++) {
		window[Chess.algebraicFromSquare(i)]=i;
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
	
	console.log(game.getPosition().countLegalMoves(Piece.BLACK));
	
	server.subscribe("*", function(url, data) {
		if(url !== "/heartbeat") {
			console.log(url, data);
		}
	});
});
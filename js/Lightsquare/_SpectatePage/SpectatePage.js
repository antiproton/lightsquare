define(function(require) {
	require("css!./spectate_page.css");
	var html = require("file!./spectate_page.html");
	var Ractive = require("ractive/ractive");
	var Event = require("js/Event");
	var Move = require("jsonchess/Move");
	var Position = require("chess/Position");
	var Square = require("chess/Square");
	var Colour = require("chess/Colour");
	
	var SQUARE_SIZE = 45;
	
	function SpectatePage(gamesList, router, prefixedRouter, parent) {
		this._router = router;
		this._prefixedRouter = prefixedRouter;
		this._gamesList = gamesList;
		
		this._prefixedRouter.addRoute("/", (function() {
			this._gamesList.startUpdating();
		}).bind(this), (function() {
			this._gamesList.stopUpdating();
			this._template.set("games", {});
		}).bind(this));
		
		this._prefixedRouter.execute();
		
		var viewingAs = {};
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				squareSize: SQUARE_SIZE,
				pieceUrl: require.toUrl("../piece_sprites/Classic/" + SQUARE_SIZE + ".png"),
				getSquareY: function(squareNo, id) {
					return 7 - Square.fromSquareNo(squareNo).adjusted[viewingAs[id]].coords.y;
				},
				getSquareX: function(squareNo, id) {
					return Square.fromSquareNo(squareNo).adjusted[viewingAs[id]].coords.x;
				},
				getSquareColour: function(squareNo) {
					var coords = Square.fromSquareNo(squareNo).coords;
					
					return (coords.x % 2 === coords.y % 2 ? 'b' : 'w');
				},
				getPieceOffset: function(piece) {
					return (piece ? -"PNBRQKpnbrqk".indexOf(piece) : 1) * SQUARE_SIZE;
				},
				getAbsolutePath: function(path) {
					return require.toUrl(path);
				},
				games: {}
			}
		});
		
		this._gamesList.Update.addHandler(function(gameDetails) {
			var id = gameDetails.id;
			
			if(!(id in viewingAs)) {
				viewingAs[id] = (Math.random() > .5 ? Colour.white : Colour.black);
			}
			
			this._updateGame(gameDetails);
		}, this);
		
		this._gamesList.GameOver.addHandler(function(id) {
			delete this._template.get("games")[id];
			delete viewingAs[id];
			
			this._template.update("games");
		}, this);
		
		this._template.on("click_game", (function(event, id) {
			this._router.setPath("/game/" + id);
		}).bind(this));
	}
	
	SpectatePage.prototype._updateGame = function(gameDetails) {
		var id = gameDetails.id;
		
		this._template.set("games." + id + ".board", new Position(gameDetails.fen).getBoardArray());
		this._template.set("games." + id + ".lastMove", gameDetails.lastMove);
	}
	
	return SpectatePage;
});
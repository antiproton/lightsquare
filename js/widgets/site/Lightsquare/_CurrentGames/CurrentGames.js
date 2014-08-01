define(function(require) {
	require("css!./current_games.css");
	var html = require("file!./current_games.html");
	var Ractive = require("lib/dom/Ractive");
	var Move = require("jsonchess/Move");
	var Position = require("chess/Position");
	var Square = require("chess/Square");
	var Event = require("lib/Event");
	var Colour = require("chess/Colour");
	
	function CurrentGames(gamesList, parent) {
		this._gamesList = gamesList;
		
		this.ClickGame = new Event(this);
		
		var squareSize = 45;
		var viewingAs = {};
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				scrollOffset: 0,
				canScrollLeft: true,
				canScrollRight: true,
				squareSize: squareSize,
				pieceUrl: require.toUrl("./piece_sprite.png"),
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
					return (piece ? -"PNBRQKpnbrqk".indexOf(piece) : 1) * squareSize;
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
			this.ClickGame.fire(id);
		}).bind(this));
		
		this._scrollAnimation = null;
		this._scrollVelocity = 0;
		
		this._template.on("scroll_left", (function() {
			this._scroll(1);
		}).bind(this));
		
		this._template.on("scroll_right", (function() {
			this._scroll(-1);
		}).bind(this));
	}
	
	CurrentGames.prototype.startUpdating = function() {
		this._gamesList.startUpdating();
	}
	
	CurrentGames.prototype.stopUpdating = function() {
		this._gamesList.stopUpdating();
		this._template.set("games", {});
	}
	
	CurrentGames.prototype._updateGame = function(gameDetails) {
		var id = gameDetails.id;
		
		this._template.set("games." + id + ".board", new Position(gameDetails.fen).getBoardArray());
		this._template.set("games." + id + ".lastMove", gameDetails.lastMove);
	}
	
	CurrentGames.prototype._scroll = function(velocity) {
		if(this._scrollAnimation) {
			this._scrollAnimation.stop();
		}
		
		this._scrollVelocity += velocity;
		
		var containerWidth = this._template.nodes.scroll_outer.offsetWidth;
		var scrollWidth = this._template.nodes.scroll_inner.scrollWidth;
		var minOffset = -(scrollWidth - containerWidth);
		var currentOffset = this._template.get("scrollOffset");
		var moveBy = containerWidth * this._scrollVelocity;
		var newOffset = currentOffset + moveBy;
		
		this._template.set("canScrollLeft", (newOffset < 0));
		this._template.set("canScrollRight", (newOffset > minOffset));
		
		newOffset = Math.max(newOffset, minOffset);
		newOffset = Math.min(0, newOffset);
		
		this._scrollAnimation = this._template.animate("scrollOffset", newOffset, {
			duration: 700,
			easing: "easeOut"
		});
		
		this._scrollAnimation.then((function() {
			this._scrollVelocity = 0;
		}).bind(this));
	}
	
	return CurrentGames;
});
define(function(require) {
	require("lib/Array.random");
	require("css!./small_game_viewer.css");
	var html = require("file!./small_game_viewer.html");
	var Ractive = require("lib/dom/Ractive");
	var Board = require("widgets/chess/Board/Board");
	
	var viewRelevance = {
		PLAYER: "player",
		OPPONENT: "opponent"
	};
	
	function SmallGameViewer(game, parent) {
		this._game = game;
		this._viewingAs = [Colour.white, Colour.black].random();
		
		this._template = new Ractive({
			el: parent,
			template: html
		});
		
		this._setupGame();
		this._setupTemplate();
	}
	
	SmallGameViewer.prototype._setupTemplate = function() {
		this._board = new Board(this._template.nodes.board);
		this._board.setSize(Board.sizes["Small"]);
		this._board.setShowCoords(false);
		this._board.setViewingAs(this._viewingAs);
		
		this._board.SelectPiece.addHandler(function(data) {
			data.cancel = true;
		}, this);
		
		this._board.setBoardArray(this._game.getPosition().getBoardArray());
		
		var lastMove = this._game.getLastMove();
		
		if(lastMove) {
			this._highlightMove(lastMove);
		}
		
		this._updatePlayerInfo();
	}
	
	SmallGameViewer.prototype._highlightMove = function(move) {
		this._board.unhighlightSquares(Board.squareHighlightTypes.LAST_MOVE_FROM, Board.squareHighlightTypes.LAST_MOVE_TO);
		this._board.highlightSquares(move.getFrom(), Board.squareHighlightTypes.LAST_MOVE_FROM);
		this._board.highlightSquares(move.getTo(), Board.squareHighlightTypes.LAST_MOVE_TO);
	}
	
	SmallGameViewer.prototype._setupGame = function() {
		this._game.Move.addHandler(function(move) {
			this._board.setBoardArray(move.getPositionAfter().getBoardArray());
			this._board.unhighlightSquares();
			this._highlightMove(move);
		}, this);
		
		this._game.GameOver.addHandler(function(result) {
			this.Inactive.fire();
		}, this);
		
		this._game.Aborted.addHandler(function() {
			this.Inactive.fire();
		}, this);
	}
	
	SmallGameViewer.prototype._relevanceFromColour = function(colour) {
		return (colour === this._viewingAs ? viewRelevance.PLAYER : viewRelevance.OPPONENT);
	}
	
	SmallGameViewer.prototype._updatePlayerInfo = function() {
		Colour.forEach((function(colour) {
			var player = this._game.getPlayer(colour);
			var relevance = this._relevanceFromColour(colour);
			
			this._template.set("players." + relevance + ".username", player.username);
			this._template.set("players." + relevance + ".rating", player.rating);
		}).bind(this));
	}
	
	return SmallGameViewer;
});
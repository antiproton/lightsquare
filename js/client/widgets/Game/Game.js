define(function(require) {
	var Template = require("lib/dom/Template");
	var Board = require("widgets/Board/Board");
	var History = require("widgets/History/History");
	var html = require("file!./resources/game.html");
	require("css!./resources/game.css");

	function Game(game, parent) {
		this._game = game;
		this._template = new Template(html, parent);

		this._board = new Board(this._template.board);
		this._board.setBoardArray(this._game.getPosition().getBoardArray());
		
		this._board.UserMove.addHandler(this, function(data) {
			var move = this._game.move(data.from, data.to);
			
			if(move.isLegal()) {
				this._board.setBoardArray(move.getPositionAfter().getBoardArray());
			}
		});
		
		this._game.MoveReceived.addHandler(this, function(data) {
			this._board.setBoardArray(data.move.getPositionAfter().getBoardArray());
		});
	}

	return Game;
});
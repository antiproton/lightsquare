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
		this._history = new History(this._template.history);
	}

	return Game;
});
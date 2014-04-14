define(function(require) {
	var html = require("file!./resources/home_page.html");
	var Template = require("lib/dom/Template");
	require("css!./resources/home_page.css");
	var Board = require("widgets/Board/Board");
	
	function HomePage(app, parent) {
		this._template = new Template(html, parent);
		
		this._board = new Board(this._template.random_game);
		this._board.setSquareSize(60);
		this._board.setShowCoords(false);
		this._board.setSquareStyle(Board.squareStyles.GREEN);
	}
	
	return HomePage;
});
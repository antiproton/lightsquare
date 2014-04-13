define(function(require) {
	var html = require("file!./resources/home.html");
	var Template = require("lib/dom/Template");
	require("css!./resources/home.css");
	var Board = require("widgets/Board/Board");
	
	function Home(app, parent) {
		this._template = new Template(html, parent);
		
		this._board = new Board(this._template.random_game);
		this._board.setSquareSize(45);
		this._board.setShowCoords(false);
	}
	
	return Home;
});
define(function(require) {
	var html = require("file!./resources/game_page.html");
	require("css!./resources/game_page.css");
	var Template = require("lib/dom/Template");
	
	function GamePage(game, user, parent) {
		this._template = new Template(html, parent);
		this._game = game;
		this._user = user;
	}
	
	return GamePage;
});
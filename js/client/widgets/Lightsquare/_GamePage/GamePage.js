define(function(require) {
	var html = require("file!./resources/game_page.html");
	require("css!./resources/game_page.css");
	var Template = require("lib/dom/Template");
	var Board = require("widgets/Board/Board");
	var Colour = require("chess/Colour");
	
	function GamePage(game, user, parent) {
		this._template = new Template(html, parent);
		this._game = game;
		this._user = user;
		
		this._setupBoard();
		this._handleUserEvents();
		
		this._adjustOrientation();
	}
	
	GamePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.board);
	}
	
	GamePage.prototype._adjustOrientation = function(viewAs) {
		viewAs = viewAs || this._game.getUserColour(this._user) || Colour.white;
		
		this._board.setViewingAs(viewAs);
	}
	
	GamePage.prototype._handleUserEvents = function() {
		this._user.HasIdentity.addHandler(this, function() {
			this._adjustOrientation();
		});
	}
	
	return GamePage;
});
define(function(require) {
	var Event = require("lib/Event");
	var html = require("file!./resources/game_page.html");
	require("css!./resources/game_page.css");
	var Template = require("lib/dom/Template");
	var Board = require("widgets/Board/Board");
	var History = require("widgets/History/History");
	var Colour = require("chess/Colour");
	
	function GamePage(game, user, parent) {
		this._template = new Template(html, parent);
		this._game = game;
		this._user = user;
		
		this.TitleChanged = new Event(this);
		
		this._setupBoard();
		this._setupHistory();
		this._setupGame();
		this._handleUserEvents();
		
		this._adjustOrientation();
	}
	
	GamePage.prototype.getTitle = function() {
		var timingStyle = this._game.getTimingStyle().getDescription();
		var userColour = this._game.getUserColour(this._user);
		var whiteName = this._game.getPlayerName(Colour.white);
		var blackName = this._game.getPlayerName(Colour.black);
		
		if(userColour === null) {
			return whiteName + " vs " + blackName + " (" + timingStyle + ")";
		}
		
		else {
			var opponentName = this._game.getPlayerName(userColour.opposite);
			var timeLeft = this._game.getTimeLeft(userColour);
			
			return opponentName + " (" + timingStyle + ") " + timeLeft.getColonDisplay();
		}
	}
	
	GamePage.prototype.getId = function() {
		return this._game.getId();
	}
	
	GamePage.prototype._setupGame = function() {
		this._game.getHistory().forEach((function(move) {
			this._history.move(move);
		}).bind(this));
		
		this._game.PromotionPieceNeeded.addHandler(this, function(data) {
			/*
			TODO
			
			involves _user.getPrefs() and a new widget.  need to find out how to do
			absolute positioning with flex display
			*/
		});
		
		this._game.Move.addHandler(this, function(data) {
			this._history.move(data.move);
			this._board.setBoardArray(data.move.getPositionAfter().getBoardArray());
		});
		
		this._game.ClockTick.addHandler(this, function() {
			this.TitleChanged.fire();
		});
	}
	
	GamePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.board);
		this._board.setBoardArray(this._game.getPosition().getBoardArray());
		
		this._board.Move.addHandler(this, function(data) {
			this._game.move(data.from, data.to);
		});
	}
	
	GamePage.prototype._setupHistory = function() {
		this._history = new History(this._template.history);
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
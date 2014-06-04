define(function(require) {
	var Event = require("lib/Event");
	var html = require("file!./game_page.html");
	require("css!./game_page.css");
	var Template = require("lib/dom/Template");
	var Board = require("widgets/chess/Board/Board");
	var History = require("widgets/chess/History/History");
	var Colour = require("chess/Colour");
	var Ractive = require("lib/dom/Ractive");
	var playerInfoHtml = require("file!./player_info.html");
	var controlsHtml = require("file!./controls.html");
	var Chat = require("./_Chat/Chat");
	
	function GamePage(game, user, parent) {
		this._template = new Template(html, parent);
		this._game = game;
		this._user = user;
		
		this.PlayerClockTick = new Event(this);
		
		this._setupPlayerInfo();
		this._setupBoard();
		this._setupControls();
		this._setupHistory();
		this._setupGame();
		this._setupChat();
		this._handleUserEvents();
		
		this._viewingAs = this._game.getUserColour(this._user) || Colour.white;
		
		this._adjustOrientation();
	}
	
	GamePage.prototype.getPlayerColour = function() {
		return this._game.getUserColour(this._user);
	}
	
	GamePage.prototype.getTimingStyle = function() {
		return this._game.getTimingStyle();
	}
	
	GamePage.prototype.getPlayerName = function(colour) {
		return this._game.getPlayer(colour).username;
	}
	
	GamePage.prototype.getTimeLeft = function(colour) {
		return this._game.getTimeLeft(colour);
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
		
		this._game.ClockTick.addHandler(this, function(data) {
			if(this._game.getUserColour(this._user) === this._game.getPosition().getActiveColour()) {
				this.PlayerClockTick.fire();
			}
			
			this._updateClocks(data.times);
		});
	}
	
	GamePage.prototype._setupPlayerInfo = function() {
		this._playerInfo = {};
		
		["player", "opponent"].forEach((function(key) {
			this._playerInfo[key] = new Ractive({
				el: this._template[key],
				template: playerInfoHtml
			});
		}).bind(this));
	}
	
	GamePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.board);
		this._board.setSquareSize(75);
		this._board.setBoardArray(this._game.getPosition().getBoardArray());
		
		this._board.Move.addHandler(this, function(data) {
			this._game.move(data.from, data.to);
		});
	}
	
	GamePage.prototype._setupControls = function() {
		this._controls = new Ractive({
			el: this._template.controls,
			template: controlsHtml
		});
	}
	
	GamePage.prototype._setupHistory = function() {
		this._history = new History(this._template.history);
		
		this._history.UserSelect.addHandler(this, function(data) {
			this._board.setBoardArray(data.move.getPositionAfter().getBoardArray());
		});
	}
	
	GamePage.prototype._setupChat = function() {
		this._chat = new Chat(this._game, this._template.chat);
	}
	
	GamePage.prototype._adjustOrientation = function() {
		this._board.setViewingAs(this._viewingAs);
		
		var players = {};
		
		Colour.forEach((function(colour) {
			players[colour] = this._game.getPlayer(colour);
		}).bind(this));
		
		var playerInfo = {
			player: players[this._viewingAs],
			opponent: players[this._viewingAs.opposite]
		};
		
		for(var key in playerInfo) {
			this._playerInfo[key].set("player", playerInfo[key]);
		}
	}
	
	GamePage.prototype._updateClocks = function(times) {
		var timesByRelevance = {
			player: times[this._viewingAs],
			opponent: times[this._viewingAs.opposite]
		};
		
		for(var key in timesByRelevance) {
			this._playerInfo[key].set("time", timesByRelevance[key]);
		}
	}
	
	GamePage.prototype._handleUserEvents = function() {
		this._user.HasIdentity.addHandler(this, function() {
			this._adjustOrientation();
		});
	}
	
	return GamePage;
});
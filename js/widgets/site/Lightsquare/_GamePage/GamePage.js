define(function(require) {
	var Event = require("lib/Event");
	var html = require("file!./game_page.html");
	require("css!./game_page.css");
	var Board = require("widgets/chess/Board/Board");
	var History = require("widgets/chess/History/History");
	var Colour = require("chess/Colour");
	var Move = require("chess/Move");
	var PieceType = require("chess/PieceType");
	var Ractive = require("lib/dom/Ractive");
	var Chat = require("./_Chat/Chat");
	
	var viewRelevance = {
		PLAYER: "player",
		OPPONENT: "opponent"
	};
	
	function GamePage(game, user, parent) {
		this._game = game;
		this._user = user;
		
		this.PlayerClockTick = new Event(this);
		
		this._viewingAs = Colour.white;
		this._setupGame();
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				players: {},
				result: this._game.getResult(),
				isInProgress: this._game.isInProgress(),
				userIsPlaying: this._userIsPlaying(),
				userIsActivePlayer: this._userIsActivePlayer(),
				drawOffered: this._game.isDrawOffered(),
				canClaimDraw: this._game.isDrawClaimable()
			}
		});
		
		this._setupChat();
		this._setupBoard();
		this._setupHistory();
		this._setupControls();
		
		this._updateUserDependentElements();
		this._handleUserEvents();
	}
	
	GamePage.prototype.getPlayerColour = function() {
		return this._game.getUserColour(this._user);
	}
	
	GamePage.prototype._userIsPlaying = function() {
		return (this.getPlayerColour() !== null);
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
		this._game.Move.addHandler(this, function(data) {
			this._history.move(data.move);
			this._board.setBoardArray(data.move.getPositionAfter().getBoardArray());
			this._template.set("userIsActivePlayer", this._userIsActivePlayer());
			this._template.set("drawOffered", false);
			this._template.set("canClaimDraw", this._game.isDrawClaimable());
			this._history.select(data.move);
		});
		
		this._game.DrawOffered.addHandler(this, function() {
			this._template.set("drawOffered", true);
		});
		
		this._game.ClockTick.addHandler(this, function(data) {
			if(this.getPlayerColour() === this._game.getPosition().getActiveColour()) {
				this.PlayerClockTick.fire();
			}
			
			this._updateClocks(data.times);
		});
		
		this._game.GameOver.addHandler(this, function(data) {
			this._template.set("result", data.result);
			this._template.set("isInProgress", false);
		});
	}
	
	GamePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.nodes.board);
		this._board.setSquareSize(75);
		this._board.setBoardArray(this._game.getPosition().getBoardArray());
		
		this._board.Move.addHandler(this, function(moveEvent) {
			var promoteTo = (this._user.getPreferences().alwaysQueen ? PieceType.queen : moveEvent.promoteTo);
			
			if(promoteTo === null && (new Move(this._game.getPosition(), moveEvent.from, moveEvent.to)).isPromotion()) {
				moveEvent.promptForPromotionPiece();
			}
			
			else {
				this._game.move(moveEvent.from, moveEvent.to, promoteTo);
			}
		});
	}
	
	GamePage.prototype._setupControls = function() {
		this._template.on("resign", (function() {
			this._game.resign();
		}).bind(this));
		
		this._template.on("offer_or_accept_draw", (function() {
			if(this._userIsActivePlayer()) {
				this._game.acceptDraw();
			}
			
			else {
				this._game.offerDraw();
			}
		}).bind(this));
		
		this._template.on("claim_draw", (function() {
			this._game.claimDraw();
		}).bind(this));
	}
	
	GamePage.prototype._setupHistory = function() {
		this._history = new History(this._template.nodes.history);
		
		this._game.getHistory().forEach((function(move) {
			this._history.move(move);
		}).bind(this));
		
		this._history.select(this._game.getLastMove());
		
		this._history.UserSelect.addHandler(this, function(data) {
			this._board.setBoardArray(data.move.getPositionAfter().getBoardArray());
		});
	}
	
	GamePage.prototype._userIsActivePlayer = function() {
		return (this.getPlayerColour() === this._game.getPosition().getActiveColour());
	}
	
	GamePage.prototype._setupChat = function() {
		this._chat = new Chat(this._game, this._template.nodes.chat);
	}
	
	GamePage.prototype._relevanceFromColour = function(colour) {
		return (colour === this._viewingAs ? viewRelevance.PLAYER : viewRelevance.OPPONENT);
	}
	
	GamePage.prototype._updateUserDependentElements = function() {
		this._viewingAs = this.getPlayerColour() || Colour.white;
		this._board.setViewingAs(this._viewingAs);
		this._updatePlayerInfo();
		this._template.set("userIsPlaying", this._userIsPlaying());
	}
	
	GamePage.prototype._updatePlayerInfo = function() {
		Colour.forEach((function(colour) {
			var player = this._game.getPlayer(colour);
			var relevance = this._relevanceFromColour(colour);
			
			this._template.set("players." + relevance + ".username", player.username);
			this._template.set("players." + relevance + ".rating", player.rating);
		}).bind(this));
	}
	
	GamePage.prototype._updateClocks = function(times) {
		Colour.forEach((function(colour) {
			this._template.set("players." + this._relevanceFromColour(colour) + ".time", times[colour]);
		}).bind(this));
	}
	
	GamePage.prototype._handleUserEvents = function() {
		this._user.HasIdentity.addHandler(this, function() {
			this._updateUserDependentElements();
		});
		
		this._user.LoggedIn.addHandler(this, function() {
			this._updateUserDependentElements();
		});
		
		this._user.LoggedOut.addHandler(this, function() {
			this._updateUserDependentElements();
		});
	}
	
	return GamePage;
});
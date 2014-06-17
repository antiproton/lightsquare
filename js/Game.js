define(function(require) {
	var ChessGame = require("chess/Game");
	var Colour = require("chess/Colour");
	var ChessMove = require("chess/Move");
	var Move = require("jsonchess/Move");
	var Event = require("lib/Event");
	var Square = require("chess/Square");
	var PieceType = require("chess/PieceType");
	var Fen = require("chess/Fen");
	var Clock = require("./Clock");
	var TimingStyle = require("chess/TimingStyle");
	var Time = require("chess/Time");
	require("lib/Array.getShallowCopy");

	function Game(user, server, gameDetails) {
		this.Move = new Event(this);
		this.ClockTick = new Event(this);
		this.GameOver = new Event(this);
		this.Aborted = new Event(this);
		this.DrawOffered = new Event(this);
		this.ChatMessageReceived = new Event(this);
		this.RematchOffered = new Event(this);
		this.RematchDeclined = new Event(this);
		this.Rematch = new Event(this);
		
		this._user = user;
		this._server = server;
		
		this._startTime = gameDetails.startTime;
		this._id = gameDetails.id;
		this._isInProgress = (gameDetails.result === null);
		this._result = gameDetails.result;
		this._isDrawOffered = gameDetails.isDrawOffered;
		this._isUndoRequested = gameDetails.isUndoRequested;
		
		this._players = {};
		this._players[Colour.white] = gameDetails.white;
		this._players[Colour.black] = gameDetails.black;
		
		this._history = [];
		this._moveQueue = [];
		
		gameDetails.history.forEach((function(move) {
			this._history.push(Move.fromJSON(move));
		}).bind(this));
		
		this._timingStyle = new TimingStyle({
			initialTime: Time.fromUnitString(gameDetails.options.initialTime, Time.minutes),
			increment: Time.fromUnitString(gameDetails.options.timeIncrement, Time.seconds)
		});
		
		this._game = new ChessGame({
			history: this._history,
			isTimed: false
		});
		
		this._clock = new Clock(this._server, this, this._timingStyle);
		
		if(this._isInProgress) {
			this._game.GameOver.addHandler(this, function(result) {
				this._gameOver(result);
			});
			
			this._requestLatestMoves();
			this._clockTick();
		}
		
		this._subscribeToServerMessages();
	}
	
	Game.prototype._subscribeToServerMessages = function() {
		this._server.subscribe("/game/" + this._id + "/move", (function(move) {
			this._handleServerMove(move);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/chat", (function(message) {
			this.ChatMessageReceived.fire({
				from: message.from,
				body: message.body
			});
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/game_over", (function(data) {
			this._gameOver(data.result);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/aborted", (function() {
			this._abort();
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/draw_offer", (function(colour) {
			if(Colour.fromFenString(colour) === this._game.getActiveColour().opposite) {
				this.DrawOffered.fire();
			}
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch_offer", (function() {
			this.RematchOffered.fire();
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch_declined", (function() {
			this.RematchDeclined.fire();
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch", (function(gameDetails) {
			this._rematch(gameDetails);
		}).bind(this));
	}
	
	Game.prototype._requestLatestMoves = function() {
		this._server.send("/game/" + this._id + "/request/moves", this._history.length);
	}
	
	Game.prototype.getId = function() {
		return this._id;
	}

	Game.prototype.move = function(from, to, promoteTo) {
		if(this._isInProgress) {
			var move = new ChessMove(this.getPosition(), from, to, promoteTo);
			
			if(move.isLegal()) {
				this._game.move(from, to, promoteTo);
				this._history.push(Move.fromMove(move));
				
				this._server.send("/game/" + this._id + "/move", {
					from: from.squareNo,
					to: to.squareNo,
					promoteTo: (promoteTo ? promoteTo.sanString : undefined)
				});
				
				this.Move.fire(move);
			}
		}
	}
	
	Game.prototype.resign = function() {
		if(this._isInProgress) {
			this._server.send("/game/" + this._id + "/resign");
		}
	}
	
	Game.prototype.offerDraw = function() {
		if(this._isInProgress) {
			this._server.send("/game/" + this._id + "/offer_draw");
		}
	}
	
	Game.prototype.acceptDraw = function() {
		if(this._isInProgress) {
			this._server.send("/game/" + this._id + "/accept_draw");
		}
	}
	
	Game.prototype.claimDraw = function() {
		if(this._isInProgress && this.isDrawClaimable()) {
			this._server.send("/game/" + this._id + "/claim_draw");
		}
	}
	
	Game.prototype.offerOrAcceptRematch = function() {
		this._server.send("/game/" + this._id + "/offer_or_accept_rematch");
	}
	
	Game.prototype.declineRematch = function() {
		this._server.send("/game/" + this._id + "/decline_rematch");
	}
	
	Game.prototype._rematch = function(gameDetails) {
		this.Rematch.fire(new Game(this._user, this._server, gameDetails));
	}
	
	Game.prototype.getPosition = function() {
		return this._game.getPosition();
	}
	
	Game.prototype.getActiveColour = function() {
		return this._game.getActiveColour();
	}
	
	Game.prototype.getResult = function() {
		return this._result;
	}
	
	Game.prototype.getHistory = function() {
		return this._history.getShallowCopy();
	}
	
	Game.prototype.getUserColour = function() {
		var player;
		var userColour = null;
		
		Colour.forEach(function(colour) {
			player = this._players[colour];
			
			if(
				(this._user.isLoggedIn() && this._user.getUsername() === player.username)
				|| this._user.getId() === player.id
			) {
				userColour = colour;
			}
		}, this);
		
		return userColour;
	}
	
	Game.prototype.getPlayer = function(colour) {
		return this._players[colour];
	}
	
	Game.prototype.getActivePlayer = function() {
		return this._players[this._game.getActiveColour()];
	}
	
	Game.prototype.getTimeLeft = function(colour) {
		return this._clock.getTimeLeft(colour);
	}
	
	Game.prototype.getTimingStyle = function() {
		return this._timingStyle;
	}
	
	Game.prototype.getStartTime = function() {
		return this._startTime;
	}
	
	Game.prototype.isInProgress = function() {
		return this._isInProgress;
	}
	
	Game.prototype.isDrawOffered = function() {
		return this._isDrawOffered;
	}
	
	Game.prototype.isDrawClaimable = function() {
		return (this._game.isFiftymoveClaimable() || this._game.isThreefoldClaimable());
	}
	
	Game.prototype.getLastMove = function() {
		return this._history[this._history.length - 1] || null;
	}
	
	Game.prototype.sendChatMessage = function(message) {
		this._server.send("/game/" + this._id + "/chat", message);
	}
	
	Game.prototype._handleServerMove = function(move) {
		if(move.index > this._history.length) {
			this._moveQueue[move.index] = move;
		}
		
		else {
			this._applyServerMove(move);
			
			var i = move.index;
			var nextMove;
			
			while(nextMove = this._moveQueue[++i]) {
				this._applyServerMove(nextMove);
			}
		}
	}
	
	Game.prototype._applyServerMove = function(serverMove) {
		if(serverMove.index in this._history) {
			this._history[serverMove.index].setTime(serverMove.time);
		}
		
		else {
			var chessMove = this._game.move(
				Square.fromSquareNo(serverMove.from),
				Square.fromSquareNo(serverMove.to),
				serverMove.promoteTo ? PieceType.fromSanString(serverMove.promoteTo) : PieceType.queen
			);
			
			if(chessMove !== null && chessMove.isLegal()) {
				var move = Move.fromMove(chessMove);
				
				move.setTime(serverMove.time);
				
				this._history.push(move);
				this.Move.fire(move);
			}
		}
	}
	
	Game.prototype._clockTick = function() {
		var times = {};
		
		Colour.forEach(function(colour) {
			times[colour] = this._clock.getTimeLeft(colour);
		}, this);
		
		this.ClockTick.fire(times);
		
		if(this._isInProgress) {
			setTimeout((function() {
				this._clockTick();
			}).bind(this), 100);
		}
	}
	
	Game.prototype._abort = function() {
		this._isInProgress = false;
		this.Aborted.fire();
	}
	
	Game.prototype._gameOver = function(result) {
		this._isInProgress = false;
		this._result = result;
		
		this.GameOver.fire(result);
	}
	
	return Game;
});
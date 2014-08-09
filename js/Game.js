define(function(require) {
	require("Array.prototype/getShallowCopy");
	var Event = require("lib/Event");
	var Promisor = require("lib/Promisor");
	var Move = require("jsonchess/Move");
	var Premove = require("jsonchess/Premove");
	var ChessGame = require("chess/Game");
	var Colour = require("chess/Colour");
	var ChessMove = require("chess/Move");
	var Square = require("chess/Square");
	var PieceType = require("chess/PieceType");
	var Fen = require("chess/Fen");
	var TimingStyle = require("chess/TimingStyle");
	var Time = require("chess/Time");
	var Clock = require("chess/Clock");

	function Game(user, server, gameDetails) {
		this._promisor = new Promisor(this);
		
		this.Move = new Event();
		this.ClockTick = new Event();
		this.GameOver = new Event();
		this.Aborted = new Event();
		this.DrawOffered = new Event();
		this.ChatMessageReceived = new Event();
		this.RematchOffered = new Event();
		this.RematchDeclined = new Event();
		this.RematchOfferCanceled = new Event();
		this.RematchOfferExpired = new Event();
		this.Rematch = new Event();
		
		this._user = user;
		this._server = server;
		
		this._options = gameDetails.options;
		this._startTime = gameDetails.startTime;
		this._endTime = gameDetails.endTime;
		this._id = gameDetails.id;
		this._isInProgress = gameDetails.isInProgress;
		this._result = gameDetails.result;
		this._isDrawOffered = gameDetails.isDrawOffered;
		this._isUndoRequested = gameDetails.isUndoRequested;
		this._addedTime = gameDetails.addedTime;
		this._rematchOfferedBy = (gameDetails.rematchOfferedBy ? Colour.fromFenString(gameDetails.rematchOfferedBy) : null);
		
		this._players = {};
		this._players[Colour.white] = gameDetails.white;
		this._players[Colour.black] = gameDetails.black;
		
		this._history = gameDetails.history.map(function(move) {
			return Move.fromJSON(move);
		});
		
		this._moveQueue = [];
		
		this._timingStyle = new TimingStyle({
			initialTime: Time.fromUnitString(this._options.initialTime, Time.minutes),
			increment: Time.fromUnitString(this._options.timeIncrement, Time.seconds)
		});
		
		this._game = new ChessGame({
			history: this._history,
			isTimed: false
		});
		
		this._game.Move.addHandler(function() {
			this._promisor.resolve("/request/premove", null);
		}, this);
		
		this._clock = new Clock(this, this._timingStyle, function() {
			return server.getServerTime();
		});
		
		for(var colour in this._addedTime) {
			this._clock.addTime(this._addedTime[colour], colour);
		}
		
		if(this._isInProgress) {
			this._requestLatestMoves();
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
		
		this._server.subscribe("/game/" + this._id + "/game_over", (function(result) {
			this._gameOver(result);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/aborted", (function() {
			this._abort();
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/draw_offer", (function(colour) {
			if(Colour.fromFenString(colour) === this._game.getActiveColour().opposite) {
				this.DrawOffered.fire();
			}
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch/offered", (function(colour) {
			var offeredBy = Colour.fromFenString(colour);
			
			this._rematchOfferedBy = offeredBy;
			this.RematchOffered.fire(offeredBy);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch/declined", (function() {
			var colour = this._rematchOfferedBy;
			
			this._rematchOfferedBy = null;
			this.RematchDeclined.fire(colour.opposite);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch/canceled", (function() {
			var colour = this._rematchOfferedBy;
			
			this._rematchOfferedBy = null;
			this.RematchOfferCanceled.fire(colour);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch/expired", (function() {
			this._rematchOfferedBy = null;
			this.RematchOfferExpired.fire();
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/rematch", (function(gameDetails) {
			this._rematch(gameDetails);
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/premove", (function(data) {
			var premove = null;
			
			if(data !== null) {
				var promoteTo = (data.promoteTo ? PieceType.fromSanString(data.promoteTo) : PieceType.queen);
				var from = Square.fromSquareNo(data.from);
				var to = Square.fromSquareNo(data.to);
				
				premove = new Premove(this.getPosition(), from, to, promoteTo);
			}
			
			this._promisor.resolve("/request/premove", premove);
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
	
	Game.prototype.premove = function(from, to, promoteTo) {
		var premove = new Premove(this.getPosition(), from, to, promoteTo);
			
		if(premove.isValid()) {
			this._server.send("/game/" + this._id + "/premove", premove);
		}
		
		return premove;
	}
	
	Game.prototype.cancelPremove = function() {
		this._server.send("/game/" + this._id + "/premove/cancel");
	}
	
	Game.prototype.getPendingPremove = function() {
		return this._promisor.get("/request/premove", function(promise) {
			if(this._isInProgress) {
				this._server.send("/game/" + this._id + "/request/premove");
			}
			
			else {
				promise.resolve(null);
			}
		});
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
		this._server.send("/game/" + this._id + "/rematch");
	}
	
	Game.prototype.declineRematch = function() {
		this._server.send("/game/" + this._id + "/rematch/decline");
	}
	
	Game.prototype.cancelRematch = function() {
		this._server.send("/game/" + this._id + "/rematch/cancel");
	}
	
	Game.prototype.rematchOfferedBy = function() {
		return this._rematchOfferedBy;
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
	
	Game.prototype.timingHasStarted = function() {
		return this._clock.timingHasStarted();
	}
	
	Game.prototype.getResult = function() {
		return this._result;
	}
	
	Game.prototype.getHistory = function() {
		return this._history.getShallowCopy();
	}
	
	Game.prototype.getUserColour = function() {
		var userColour = null;
		
		Colour.forEach(function(colour) {
			if(this._user.getPlayerId() === this._players[colour].id) {
				userColour = colour;
			}
		}, this);
		
		return userColour;
	}
	
	Game.prototype.userIsPlaying = function() {
		return (this.getUserColour() !== null);
	}
	
	Game.prototype.getPlayerName = function(colour) {
		return this._players[colour].name;
	}
	
	Game.prototype.getRating = function(colour) {
		return this._players[colour].rating;
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
	
	Game.prototype.getEndTime = function() {
		return this._endTime;
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
			this._clock.calculateTimes();
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
		
	Game.prototype._abort = function() {
		this._isInProgress = false;
		this.Aborted.fire();
	}
	
	Game.prototype._gameOver = function(result) {
		this._isInProgress = false;
		this._result = result;
		
		this.GameOver.fire(result);
	}
	
	Game.prototype.getBackupDetails = function() {
		return {
			history: this._history.map(function(move) {
				return Move.fromMove(move);
			}),
			startTime: this._startTime,
			options: this._options,
			addedTime: this._addedTime,
			id: this._id
		};
	}
	
	return Game;
});
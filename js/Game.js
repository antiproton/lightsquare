define(function(require) {
	var objToArray = require("js/objToArray");
	var Event = require("js/Event");
	var Promisor = require("js/Promisor");
	var Move = require("jsonchess/Move");
	var Premove = require("jsonchess/Premove");
	var ChessGame = require("chess/Game");
	var Colour = require("chess/Colour");
	var ChessMove = require("chess/Move");
	var Square = require("chess/Square");
	var PieceType = require("chess/PieceType");
	var Fen = require("chess/Fen");
	var TimingStyle = require("chess/TimingStyle");
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
		this.startTime = gameDetails.startTime;
		this.endTime = gameDetails.endTime;
		this.id = gameDetails.id;
		this.isInProgress = gameDetails.isInProgress;
		this.result = gameDetails.result;
		this.isDrawOffered = gameDetails.isDrawOffered;
		this.isUndoRequested = gameDetails.isUndoRequested;
		this._addedTime = gameDetails.addedTime;
		this.rematchOfferedBy = (gameDetails.rematchOfferedBy ? Colour.byFenString[gameDetails.rematchOfferedBy] : null);
		
		this._players = {};
		this._players[Colour.white] = gameDetails.white;
		this._players[Colour.black] = gameDetails.black;
		
		this.history = gameDetails.history.map(function(move) {
			return Move.fromJSON(move);
		});
		
		this._moveQueue = [];
		
		this.timingStyle = new TimingStyle({
			initialTime: this._options.initialTime,
			increment: this._options.timeIncrement
		});
		
		this._game = new ChessGame({
			history: this.history,
			isTimed: false
		});
		
		this._game.Move.addHandler(function() {
			this._promisor.resolve("/request/premove", null);
		}, this);
		
		this._clock = new Clock(this, this.timingStyle, function() {
			return server.getServerTime();
		});
		
		for(var colour in this._addedTime) {
			this._clock.addTime(this._addedTime[colour], colour);
		}
		
		if(this.isInProgress) {
			this._requestLatestMoves();
		}
		
		this._subscribeToServerMessages();
	}
	
	Game.prototype._subscribeToServerMessages = function() {
		this._server.subscribe("/game/" + this.id + "/move", (function(move) {
			this._handleServerMove(move);
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/chat", (function(message) {
			this.ChatMessageReceived.fire({
				from: message.from,
				body: message.body
			});
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/game_over", (function(result) {
			this._gameOver(result);
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/aborted", (function() {
			this._abort();
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/draw_offer", (function(colour) {
			if(Colour.fromFenString(colour) === this._game.position.activeColour.opposite) {
				this.DrawOffered.fire();
			}
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/rematch/offered", (function(colour) {
			var offeredBy = Colour.fromFenString(colour);
			
			this.rematchOfferedBy = offeredBy;
			this.RematchOffered.fire(offeredBy);
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/rematch/declined", (function() {
			var colour = this.rematchOfferedBy;
			
			this.rematchOfferedBy = null;
			this.RematchDeclined.fire(colour.opposite);
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/rematch/canceled", (function() {
			var colour = this.rematchOfferedBy;
			
			this.rematchOfferedBy = null;
			this.RematchOfferCanceled.fire(colour);
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/rematch/expired", (function() {
			this.rematchOfferedBy = null;
			this.RematchOfferExpired.fire();
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/rematch", (function(gameDetails) {
			this._rematch(gameDetails);
		}).bind(this));
		
		this._server.subscribe("/game/" + this.id + "/premove", (function(data) {
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
		this._server.send("/game/" + this.id + "/request/moves", this.history.length);
	}

	Game.prototype.move = function(from, to, promoteTo) {
		if(this.isInProgress) {
			var move = new ChessMove(this.getPosition(), from, to, promoteTo);
			
			if(move.isLegal()) {
				this._game.move(from, to, promoteTo);
				this.history.push(Move.fromMove(move));
				
				this._server.send("/game/" + this.id + "/move", {
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
			this._server.send("/game/" + this.id + "/premove", premove);
		}
		
		return premove;
	}
	
	Game.prototype.cancelPremove = function() {
		this._server.send("/game/" + this.id + "/premove/cancel");
	}
	
	Game.prototype.getPendingPremove = function() {
		return this._promisor.get("/request/premove", function(promise) {
			if(this.isInProgress) {
				this._server.send("/game/" + this.id + "/request/premove");
			}
			
			else {
				promise.resolve(null);
			}
		});
	}
	
	Game.prototype.resign = function() {
		if(this.isInProgress) {
			this._server.send("/game/" + this.id + "/resign");
		}
	}
	
	Game.prototype.offerDraw = function() {
		if(this.isInProgress) {
			this._server.send("/game/" + this.id + "/offer_draw");
		}
	}
	
	Game.prototype.acceptDraw = function() {
		if(this.isInProgress) {
			this._server.send("/game/" + this.id + "/accept_draw");
		}
	}
	
	Game.prototype.claimDraw = function() {
		if(this.isInProgress && this.isDrawClaimable()) {
			this._server.send("/game/" + this.id + "/claim_draw");
		}
	}
	
	Game.prototype.offerOrAcceptRematch = function() {
		this._server.send("/game/" + this.id + "/rematch");
	}
	
	Game.prototype.declineRematch = function() {
		this._server.send("/game/" + this.id + "/rematch/decline");
	}
	
	Game.prototype.cancelRematch = function() {
		this._server.send("/game/" + this.id + "/rematch/cancel");
	}
	
	Game.prototype._rematch = function(gameDetails) {
		this.Rematch.fire(new Game(this._user, this._server, gameDetails));
	}
	
	Game.prototype.getPosition = function() {
		return this._game.position;
	}
	
	Game.prototype.getActiveColour = function() {
		return this._game.position.activeColour;
	}
	
	Game.prototype.timingHasStarted = function() {
		return this._clock.timingHasStarted();
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
	
	Game.prototype.getPlayers = function() {
		return objToArray(this._players);
	}
	
	Game.prototype.getPlayer = function(colour) {
		return this._players[colour];
	}
	
	Game.prototype.getRating = function(colour) {
		return this._players[colour].rating;
	}
	
	Game.prototype.getActivePlayer = function() {
		return this._players[this._game.position.activeColour];
	}
	
	Game.prototype.getTimeLeft = function(colour) {
		return this._clock.getTimeLeft(colour);
	}
	
	Game.prototype.isDrawClaimable = function() {
		return (this._game.isFiftymoveClaimable() || this._game.isThreefoldClaimable());
	}
	
	Game.prototype.getLastMove = function() {
		return this.history[this.history.length - 1] || null;
	}
	
	Game.prototype.sendChatMessage = function(message) {
		this._server.send("/game/" + this.id + "/chat", message);
	}
	
	Game.prototype._handleServerMove = function(move) {
		if(move.index > this.history.length) {
			this._enqueueServerMove(move);
		}
		
		else if(move.index < this.history.length) {
			this._updateTimeFromServerMove(move);
		}
		
		else {
			this._applyServerMove(move);
		}
	}
	
	Game.prototype._enqueueServerMove = function(move) {
		this._moveQueue[move.index] = move;
	}
	
	Game.prototype._updateTimeFromServerMove = function(move) {
		this.history[move.index].time = move.time;
		this._clock.calculateTimes();
	}
	
	Game.prototype._applyServerMove = function(jsonchessMove) {
		var move = Move.decode(jsonchessMove, this.position);
		
		this._game.addMove(move);
		this.history.push(move);
		this.Move.fire(move);
		
		var next = this._moveQueue[move.index + 1];
		
		if(next) {
			this._applyServerMove(next);
		}
	}
		
	Game.prototype._abort = function() {
		this.isInProgress = false;
		this.Aborted.fire();
	}
	
	Game.prototype._gameOver = function(result) {
		this.isInProgress = false;
		this.result = result;
		this.GameOver.fire(result);
	}
	
	Game.prototype.getBackupDetails = function() { //FIXME make this work with the new formats
		return {
			history: this.history.map(function(move) {
				return Move.fromMove(move);
			}),
			startTime: this.startTime,
			options: this._options,
			addedTime: this._addedTime,
			id: this.id
		};
	}
	
	return Game;
});
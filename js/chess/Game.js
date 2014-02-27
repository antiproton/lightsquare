define(function(require) {
	var Event = require("lib/Event");
	var time = require("lib/time");
	var Piece = require("chess/Piece");
	var Position = require("chess/Position");
	var PiecesTaken = require("chess/PiecesTaken");
	var Chess = require("chess/Chess");
	var Move = require("chess/Move");
	var Fen = require("chess/Fen");
	require("lib/Array.getShallowCopy");

	function Game(options) {
		this._state = Game.states.IN_PROGRESS;
		this._startTime = time();
		this._endTime = null;
		this._result = null;
		this._resultType = null;
		
		this._options = {
			startingFen: Fen.STARTING_FEN,
			clockStartHalfmove: 1,
			clockStartDelay: 0,
			initialTime: 600,
			timeIncrement: 0,
			timingStyle: Game.timingStyles.SUDDEN_DEATH,
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: 600,
			isRated: true
		};
		
		for(var p in options) {
			this._options[p] = options[p];
		}
		
		this._isThreefoldClaimable = false;
		this._isFiftymoveClaimable = false;

		this._position = new Position(this._options.startingFen);
		this._startingPosition = new Position(this._options.startingFen);
		this._history = [];
		this._piecesTaken = new PiecesTaken();
		
		this._checkTimeTimeout = null;
		this._clocks = [];
		this._clocks[Piece.WHITE] = this._options.initialTime;
		this._clocks[Piece.BLACK] = this._options.initialTime;
	}
	
	Game.states = {
		IN_PROGRESS: "In progress",
		FINISHED: "Finished"
	};
	
	Game.timingStyles = {
		SUDDEN_DEATH: "Sudden death",
		FISCHER: "Fischer",
		FISCHER_AFTER: "Fischer After",
		BRONSTEIN_DELAY: "Bronstein delay",
		SIMPLE_DELAY: "Simple delay",
		HOURGLASS: "Hourglass",
		PER_MOVE: "Per move",
		NONE: "None"
	};
	
	Game.prototype.getState = function() {
		return this._state;
	}
	
	Game.prototype.getStartTime = function() {
		return this._startTime;
	}
	
	Game.prototype.getEndTime = function() {
		return this._endTime;
	}
	
	Game.prototype.getResult = function() {
		return this._result;
	}
	
	Game.prototype.getResultType = function() {
		return this._resultType;
	}

	Game.prototype.isFiftymoveClaimable = function() {
		return (this._position.getFiftymoveClock() > 49);
	}
	
	Game.prototype.isThreefoldClaimable = function() {
		return this._isThreefoldClaimable;
	}
	
	Game.prototype.getPosition = function() {
		return this._position.getCopy();
	}
	
	Game.prototype.getHistory = function() {
		return this._history.getShallowCopy();
	}
	
	Game.prototype.getOptions = function() {
		return this._options;
	}

	Game.prototype.move = function(from, to, promoteTo) {
		if(this._state === Game.states.IN_PROGRESS) {
			var move = new Move(this._position, from, to, promoteTo);
			var colour = move.getColour();
			var oppColour = Chess.getOppColour(colour);
	
			if(move.isLegal()) {
				this._position = move.getPositionAfter();
	
				if(move.isMate()) {
					this._gameOver(Result.win(colour), Result.types.CHECKMATE);
				}
	
				else {
					if(!this._position.playerCanMate(Piece.WHITE) && !this._position.playerCanMate(Piece.BLACK)) {
						this._gameOver(Result.DRAW, Result.types.STALEMATE_INSUFFICIENT_MATERIAL);
					}
	
					if(this._position.countLegalMoves(oppColour) === 0) {
						this._gameOver(Result.DRAW, Result.types.STALEMATE_NO_MOVES);
					}
				}
	
				this._history.push(move);
				this._checkThreefold();
				this._checkTime();
			}
	
			return move;
		}
	}

	Game.prototype.undoLastMove = function() {
		this._history.pop();
		
		var move = this._getLastMove();
		
		if(move !== null) {
			this._position = move.getPositionAfter();
		}
		
		else {
			this._position = this._startingPosition.getCopy();
		}
		
		this._checkThreefold();
		this._checkTime();
	}
	
	Game.prototype._getLastMove = function() {
		return this._history[this._history.length - 1] || null;
	}

	Game.prototype._checkTime = function() {
		this._calculateTime();
		this._checkForTimeouts();
		
		if(this._state !== Game.states.FINISHED) {
			this._scheduleNextTimeCheck();
		}
	}
	
	Game.prototype._scheduleNextTimeCheck = function() {
		var active = this._position.getActiveColour();
		var timeLeft = this._clocks[active];
		
		if(this._checkTimeTimeout !== null) {
			clearTimeout(this._checkTimeTimeout);
		}
		
		this._checkTimeTimeout = setTimeout((function() {
			this._checkTime();
		}).bind(this), timeLeft);
	}
	
	Game.prototype._checkForTimeouts = function() {
		var colours = [Piece.WHITE, Piece.BLACK];
		var colour, oppColour;
		
		for(var i = 0; i < colours.length; i++) {
			colour = colours[i];
			oppColour = Chess.getOppColour(colour);
			
			if(this._clocks[colour] <= 0) {
				var result = (this._position.playerCanMate(oppColour) ? Result.win(oppColour) : Result.DRAW);
				
				this._gameOver(result, Result.types.TIMEOUT);
			}
		}
	}

	Game.prototype._calculateTime = function() {
		//TODO
	}

	Game.prototype._checkThreefold = function() {
		var currentFenString = this._position.getFen();
		var currentFen = new Fen(currentFenString);
		var limit = 3;
		var occurrences = 0;

		if(currentFenString === this._startingPosition.getFen()) {
			limit = 2;
		}
		
		var fen;

		this._history.forEach(function(move) {
			fen = new Fen(move.getPositionAfter().getFen());
			
			if(
				fen.position === currentFen.position
				&& fen.active === currentFen.active
				&& fen.castling === currentFen.castling
				&& fen.epTarget === currentFen.epTarget
			) {
				occurrences++;
			}
		});

		this._isThreefoldClaimable = (occurrences >= limit);
	}

	Game.prototype._gameOver = function(result, resultType) {
		this._state = Game.states.FINISHED;
		this._result = result;
		this._resultType = resultType;
		this._endTime = time();
	}

	return Game;
});
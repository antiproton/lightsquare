define(function(require) {
	var Event=require("lib/Event");
	var time=require("lib/time");
	var Piece=require("chess/Piece");
	var Position=require("chess/Position");
	var History=require("chess/history/History");
	var PiecesTaken=require("chess/PiecesTaken");
	var Chess=require("chess/Chess");
	var Move=require("chess/Move");
	var Fen=require("chess/Fen");
	require("lib/Array.getShallowCopy");

	function Game(options) {
		this._state=Game.state.IN_PROGRESS;
		this._startTime=time();
		this._endTime=null;
		this._result=null;
		this._resultDetails=null;
		
		this._options={
			startingFen: Fen.STARTING_FEN,
			clockStartHalfmove: 1,
			clockStartDelay: 0,
			initialTime: 600,
			timeIncrement: 0,
			timingStyle: Game.timingStyles.SUDDEN_DEATH,
			overtime: false,
			overtimeCutoff: 40,
			overtimeIncrement: 600,
			rated: true
		};
		
		this._isThreefoldClaimable=false;
		this._isFiftymoveClaimable=false;

		this._position=new Position(this._options.startingFen);
		this._startingPosition=new Position(this._options.startingFen);
		this._history=[];
		this._piecesTaken=new PiecesTaken();
	}
	
	Game.state={
		IN_PROGRESS: "In progress",
		CANCELED: "Canceled",
		ABANDONED: "Abandoned",
		FINISHED: "Finished"
	};
	
	Game.timingStyles={
		SUDDEN_DEATH: "Sudden death",
		FISCHER: "Fischer",
		FISCHER_AFTER: "Fischer After",
		BRONSTEIN_DELAY: "Bronstein delay",
		SIMPLE_DELAY: "Simple delay",
		HOURGLASS: "Hourglass",
		PER_MOVE: "Per move",
		NONE: "None"
	};
	
	Game.prototype.getState=function() {
		return this._state;
	}
	
	Game.prototype.getStartTime=function() {
		return this._startTime;
	}
	
	Game.prototype.getEndTime=function() {
		return this._endTime;
	}
	
	Game.prototype.getResult=function() {
		return this._result;
	}
	
	Game.prototype.getResultDetails=function() {
		return this._resultDetails;
	}

	Game.prototype.isFiftymoveClaimable=function() {
		return (this._position.getFiftymoveClock()>49);
	}
	
	Game.prototype.isThreefoldClaimable=function() {
		return this._isThreefoldClaimable;
	}
	
	Game.prototype.getPosition=function() {
		return this._position.getCopy();
	}
	
	Game.prototype.getHistory=function() {
		return this._history.getShallowCopy();
	}

	Game.prototype.move=function(from, to, promoteTo) {
		var move=new Move(this._position, from, to, promoteTo);
		var colour=move.getColour();
		var oppColour=Chess.getOppColour(colour);

		if(move.isLegal()) {
			this._position=move.getPositionAfter();
			this.drawOffered=false;

			if(move.isMate()) {
				//this._gameOver(Result.WinResult[colour], RESULT_DETAILS_CHECKMATE); //FIXME
			}

			else {
				if(!this._position.playerCanMate(Piece.WHITE) && !this._position.playerCanMate(Piece.BLACK)) {
					//this._gameOver(RESULT_DRAW, RESULT_DETAILS_INSUFFICIENT);
				}

				if(this._position.countLegalMoves(oppColour)===0 && this.type!==GAME_TYPE_BUGHOUSE) {
					//this._gameOver(RESULT_DRAW, RESULT_DETAILS_STALEMATE);
				}
			}

			this._history.push(move);
			this._checkThreefold();
		}

		return move;
	}

	Game.prototype.undoLastMove=function() {
		this._history.pop();
		
		var move=this.getLastMove();
		
		if(move!==null) {
			this._position.setFen(move.getResultingFen());
		}
		
		else {
			this._position.setFen(this._startingPosition.getFen());
		}
		
		this._checkThreefold();
	}
	
	Game.prototype.getLastMove=function() {
		if(this._history.length>0) {
			return this._history[this._history.length-1];
		}
		
		else {
			return null;
		}
	}
	
	Game.prototype.resign=function(colour) {
		//this._gameOver(etc)
	}
	
	Game.prototype.drawByAgreement=function() {
		//...
	}

	Game.prototype._checkTime=function(colour) {
		/*
		FIXME uses old constants
		*/
		//if(this.time[colour]<1) {
		//	var oppColour=Chess.getOppColour(colour);
		//	var result=this._position.playerCanMate(oppColour)?oppColour:DRAW;
		//	this._gameOver(result, RESULT_DETAILS_TIMEOUT);
		//}
	}

	Game.prototype._calculateTime=function() {

	}

	Game.prototype._checkThreefold=function() {
		var currentFenString=this._position.getFen();
		var currentFen=new Fen(currentFenString);
		var limit=3;
		var occurrences=0;

		if(currentFenString===this._startingPosition.getFen()) {
			limit=2;
		}
		
		var fen;

		this._history.forEach(function(move) {
			fen=new Fen(move.getResultingFen());
			
			if(
				fen.position===currentFen.position
				&& fen.active===currentFen.active
				&& fen.castling===currentFen.castling
				&& fen.epTarget===currentFen.epTarget
			) {
				occurrences++;
			}
		});

		this._isThreefoldClaimable=(occurrences>=limit);
	}

	Game.prototype._gameOver=function(result, result_details) {
		/*
		FIXME uses old constants
		*/
		//this.state=GAME_STATE_FINISHED;
		//this.result=result;
		//this.resultDetails=result_details;
		//this.drawOffered=false;
	}

	return Game;
});
define(function(require) {
	var Event=require("lib/Event");
	var time=require("lib/time");
	var Piece=require("chess/Piece");
	var Position=require("chess/Position");
	var History=require("chess/history/History");
	var PiecesTaken=require("chess/PiecesTaken");
	var Chess=require("chess/Chess");
	var MoveLabel=require("chess/MoveLabel");

	function Class() {
		this.Moved=new Event(this);

		this.state=GAME_STATE_IN_PROGRESS;
		this.timeStart=time();
		this.timeFinish=null;
		this.type=GAME_TYPE_STANDARD;
		this.variant=VARIANT_STANDARD;
		this.subvariant=SUBVARIANT_NONE;
		this.result=null;
		this.resultDetails=null;
		this.clockStartIndex=1;
		this.clockStartDelay=0;
		this.timingInitial=600;
		this.timingIncrement=0;
		this.timingStyle=TIMING_SUDDEN_DEATH;
		this.timingOvertime=false;
		this.timingOvertimeCutoff=40;
		this.timingOvertimeIncrement=600;
		this.threefoldClaimable=false;
		this.fiftymoveClaimable=false;
		this.drawOffered=false;
		this.rated=true;

		this.position=new Position();
		this.startingPosition=new Position();
		this.history=new History();
		this.piecesTaken=new PiecesTaken();

		this.history.SelectedMoveChanged.addHandler(this, function(data) {
			if(data.move!==null) {
				this.position.setFen(data.move.resultingFen);
			}

			else {
				this.position.setFen(this.startingPosition.getFen());
			}
		});
	}

	Class.prototype.setStartingFen=function(fen) {
		this.startingPosition.setFen(fen);
		this.position.setFen(fen);
		this.history.clear();
		this.history.setStartingColour(this.position.active);
		this.history.setStartingFullmove(this.position.fullmove);
	}

	Class.prototype.getStartingFen=function() {
		return this.startingPosition.getFen();
	}

	Class.prototype.move=function(from, to, promoteTo, dryrun) {
		/*
		if(move.isLegal) {
				if(!dryrun) {
					this.drawOffered=false;

					if(this.isMated(oppColour)) {
						this._gameOver(Result.WinResult[colour], RESULT_DETAILS_CHECKMATE);
					}

					else {
						if(!this.canMate(Piece.WHITE) && !this.canMate(Piece.BLACK)) {
							this._gameOver(RESULT_DRAW, RESULT_DETAILS_INSUFFICIENT);
						}



						if(this.countLegalMoves(oppColour)===0 && this.type!==GAME_TYPE_BUGHOUSE) {
							this._gameOver(RESULT_DRAW, RESULT_DETAILS_STALEMATE);
						}

						if(this.positionBefore.fiftymoveClock>49) {
							this.fiftymoveClaimable=true;
						}

						this._checkThreefold(); //FIXME move isn't in the history yet so this is 1 move behind
					}


					if(this.history.move(move)) {
						this.Moved.fire();
					}
				}

				if(dryrun) {
					this.positionBefore=oldPosition;
				}
		*/

		return move;
	}

	Class.prototype.undo=function() {
		this.history.undo();
	}

	Class.prototype._checkTime=function(colour) {
		if(this.time[colour]<1) {
			var oppColour=Chess.getOppColour(colour);
			var result=this.canMate(oppColour)?oppColour:DRAW;
			this._gameOver(result, RESULT_DETAILS_TIMEOUT);
		}
	}

	Class.prototype._calculateTime=function() {

	}

	Class.prototype._checkThreefold=function() {
		var fen=this.position.getFen();
		var limit=3;
		var n=0;

		if(fen===this.startingPosition.getFen()) {
			limit--;
		}

		this.history.mainLine.moveList.each(function(move) {
			if(move.fen===fen) {
				n++;
			}
		});

		this.threefoldClaimable=(n>=limit);
	}

	Class.prototype._gameOver=function(result, result_details) {
		this.state=GAME_STATE_FINISHED;
		this.result=result;
		this.resultDetails=result_details;
		this.drawOffered=false;
	}

	return Class;
});
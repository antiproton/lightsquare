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

	Class.prototype.countLegalMoves=function(colour) {
		var legalMoves=0;
		var piece;

		for(var square=0; square<64; square++) {
			piece=this.position.board.getSquare(square);

			if(piece!==Piece.NONE && Piece.getColour(piece)===colour) {
				legalMoves+=this.getLegalMovesFrom(square).length;
			}
		}

		return legalMoves;
	}

	Class.prototype.getLegalMovesFrom=function(square) {
		var legalMoves=[];
		var piece, reachableSquares;

		if(this.position.board.getSquare(square)!==Piece.NONE) {
			piece=new Piece(this.position.board.getSquare(square));
			reachableSquares=Chess.getReachableSquares(piece.type, square, piece.colour);

			for(var i=0; i<reachableSquares.length; i++) {
				if(this.move(square, reachableSquares[i], Piece.QUEEN, true).isLegal) {
					legalMoves.push(reachableSquares[i]);
				}
			}
		}

		return legalMoves;
	}

	Class.prototype.move=function(from, to, promoteTo, dryrun) {
		/*
		if(move.isLegal) {
				if(colour===Piece.BLACK) {
					this.positionBefore.fullmove++;
				}

				this.positionBefore.active=oppColour;

				if(move.capturedPiece!==null || piece.type===Piece.PAWN) {
					this.positionBefore.fiftymoveClock=0;
				}

				else {
					this.positionBefore.fiftymoveClock++;
				}

				if(piece.type!==Piece.PAWN || !Chess.isDoublePawnMove(relFrom, relTo)) {
					this.positionBefore.epTarget=null;
				}

				if(piece.type===Piece.KING || move.isCastling) {
					for(file=0; file<8; file++) {
						this.positionBefore.castlingRights.setByFile(colour, file, false);
					}
				}

				else if(piece.type===Piece.ROOK) {
					this.positionBefore.castlingRights.setByFile(colour, Chess.xFromSquare(this._from), false);
				}

				if(this.isInCheck(oppColour)) {
					this._label.check=MoveLabel.SIGN_CHECK;
				}

				if(this.isMated(oppColour)) {
					this._label.check=MoveLabel.SIGN_MATE;
				}

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

	Class.prototype.isInCheck=function(colour) {
		return (Chess.getAllAttackers(
			this.position.board.getBoardArray(),
			this.position.kingPositions[colour],
			Chess.getOppColour(colour)
		).length>0);
	}

	Class.prototype.isMated=function(colour) {
		return (this.isInCheck(colour) && this.countLegalMoves(colour)===0);
	}

	Class.prototype.canMate=function(colour) {
		var pieces=[];
		var bishops=[];
		var knights=[];

		pieces[Piece.KNIGHT]=0;
		pieces[Piece.BISHOP]=0;
		bishops[Piece.WHITE]=0;
		bishops[Piece.BLACK]=0;
		knights[Piece.WHITE]=0;
		knights[Piece.BLACK]=0;

		var piece, pieceColour, pieceType;

		for(var square=0; square<64; square++) {
			piece=new Piece(this.position.board.getSquare(square));

			if(piece.type!==Piece.NONE && piece.type!==Piece.KING) {
				if(piece.colour===colour && (piece.type===Piece.PAWN || piece.type===Piece.ROOK || piece.type===Piece.QUEEN)) {
					return true;
				}

				if(piece.type===Piece.BISHOP) {
					bishops[piece.colour]++;
					pieces[Piece.BISHOP]++;
				}

				if(piece.type===Piece.KNIGHT) {
					knights[piece.colour]++;
					pieces[Piece.KNIGHT]++;
				}
			}
		}

		return (
			(bishops[Piece.WHITE]>0 && bishops[Piece.BLACK]>0)
			|| (pieces[Piece.BISHOP]>0 && pieces[Piece.KNIGHT]>0)
			|| (pieces[Piece.KNIGHT]>2 && knights[colour]>0)
		);
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
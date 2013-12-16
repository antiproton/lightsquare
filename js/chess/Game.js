define(function(require) {
	var Event=require("lib/Event");

	var Position=require("./Position");
	var History=require("./History");
	var PiecesTaken=require("./PiecesTaken");
	var Chess=require("./Chess");
	var time=require("lib/time");

	function Game() {
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

	Game.prototype.setStartingFen=function(fen) {
		this.startingPosition.setFen(fen);
		this.position.setFen(fen);
		this.history.clear();
		this.history.setStartingColour(this.position.active);
		this.history.setStartingFullmove(this.position.fullmove);
	}

	Game.prototype.getStartingFen=function() {
		return this.startingPosition.getFen();
	}

	Game.prototype.countLegalMoves=function(colour) {
		var legalMoves=0;
		var piece;

		for(var square=0; square<64; square++) {
			piece=this.position.board.getSquare(square);

			if(piece!==Chess.SQ_EMPTY && Piece.getColour(piece)===colour) {
				legalMoves+=this.getLegalMovesFrom(square).length;
			}
		}

		return legalMoves;
	}

	Game.prototype.getLegalMovesFrom=function(square) {
		var legalMoves=[];
		var piece, reachableSquares;

		if(this.position.board.getSquare(square)!==Chess.SQ_EMPTY) {
			piece=new Piece(this.position.board.getSquare(square));
			reachableSquares=Chess.getReachableSquares(piece.type, square, piece.colour);

			for(var i=0; i<reachableSquares.length; i++) {
				if(this.move(square, reachableSquares[i], Chess.QUEEN, true).isLegal) {
					legalMoves.push(reachableSquares[i]);
				}
			}
		}

		return legalMoves;
	}

	Game.prototype.move=function(from, to, promoteTo, dryrun) {
		promoteTo=promoteTo||Chess.QUEEN;
		dryrun=dryrun||false;

		var colour=this.position.active;
		var piece=new Piece(this.position.board.getSquare(from));
		var move=this.history.createMove();

		move.from=from;
		move.to=to;

		if(Chess.isOnBoard(from) && Chess.isOnBoard(to) && piece.type!==Chess.SQ_EMPTY && piece.colour===colour) {
			var targetPiece=null;

			if(this.position.board.getSquare(to)!==Chess.SQ_EMPTY) {
				targetPiece=new Piece(this.position.board.getSquare(to));
			}

			var label=new MoveLabel();
			var oldPosition=this.position.copy();
			var fromCoords=Chess.coordsFromSquare(from);
			var toCoords=Chess.coordsFromSquare(to);
			var relFrom=Chess.getRelativeSquare(from, colour);
			var relTo=Chess.getRelativeSquare(to, colour);
			var oppColour=Chess.getOppColour(colour);

			var isUnobstructed=(
				!Chess.isBlocked(this.position.board.getBoardArray(), from, to)
				&& (targetPiece===null || targetPiece.colour!==colour)
			);

			label.piece=Fen.getPieceChar(Piece.getPiece(piece.type, Piece.WHITE));
			label.to=Chess.getAlgebraicSquare(to);

			if(piece.type!==Chess.PAWN && piece.type!==Chess.KING) {
				label.disambiguation=Chess.disambiguate(this.position.board.getBoardArray(), piece.type, colour, from, to);
			}

			if(targetPiece!==null && targetPiece.colour===oppColour) {
				label.sign=MoveLabel.SIGN_CAPTURE;
				move.capturedPiece=this.position.board.getSquare(to);
			}

			if(Chess.isRegularMove(piece.type, fromCoords, toCoords) && isUnobstructed) {
				move.isValid=true;
				move.boardChanges[from]=Chess.SQ_EMPTY;
				move.boardChanges[to]=this.position.board.getSquare(from);
			}

			else if(piece.type===Chess.PAWN && isUnobstructed) {
				var capturing=Chess.isPawnCapture(relFrom, relTo);
				var validPromotion=false;
				var promotion=false;

				if(capturing) {
					label.disambiguation=Chess.file_str(from);
					label.sign=MoveLabel.SIGN_CAPTURE;
				}

				label.piece="";

				if(Chess.isPawnPromotion(relTo)) {
					promotion=true;

					if(promoteTo>=Chess.KNIGHT && promoteTo<=Chess.QUEEN) {
						move.boardChanges[to]=Piece.getPiece(promoteTo, colour);
						label.special=MoveLabel.SIGN_PROMOTE+Fen.getPieceChar[Piece.getPiece(promoteTo, Piece.WHITE)];
						move.promoteTo=promoteTo;
						validPromotion=true;
					}
				}

				if(validPromotion || !promotion) {
					if(targetPiece===null) {
						if(Chess.isDoublePawnMove(relFrom, relTo)) {
							move.isValid=true;
							position.epTarget=Chess.getRelativeSquare(relTo-8, colour);
						}

						else if(Chess.isPawnMove(relFrom, relTo)) {
							move.isValid=true;
						}

						else if(capturing && to===this.position.epTarget) {
							move.isValid=true;
							move.boardChanges[Chess.getEpPawn(from, to)]=Chess.SQ_EMPTY;
							label.sign=MoveLabel.SIGN_CAPTURE;
							move.capturedPiece=Piece.getPiece(Chess.PAWN, oppColour);
						}
					}

					else if(capturing) {
						move.isValid=true;
					}
				}

				if(move.isValid) {
					move.boardChanges[from]=Chess.SQ_EMPTY;

					if(!promotion) {
						move.boardChanges[to]=this.position.board.getSquare(from);
					}
				}
			}

			else if((piece.type===Chess.KING || piece.type===Chess.ROOK) && !this.isInCheck(colour)) {
				move.isCastling=true;

				if(this.variant===VARIANT_960) {
					var backrank=[0, 7][colour];

					if(Chess.yFromSquare(from)===backrank && Chess.yFromSquare(to)===backrank) {
						kingSquare=this.position.kingPositions[colour];
						rookSquare=null;

						//find out whether it's kingside or queenside based on move direction

						var side;

						if(piece.type===Chess.ROOK) {
							side=(Chess.xFromSquare(from)<Chess.xFromSquare(to))?Chess.QUEENSIDE:Chess.KINGSIDE;
						}

						else if(piece.type===Chess.KING) {
							side=(Chess.xFromSquare(from)>Chess.xFromSquare(to))?Chess.QUEENSIDE:Chess.KINGSIDE;
						}

						var rookDestinationFile=[5, 3][side];
						var kingDestinationFile=[6, 2][side];
						var edge=[7, 0][side];

						//if rook move, rook is on from square

						if(piece.type===Chess.ROOK) {
							rookSquare=from;
						}

						//if king move, find rook between edge and king

						else {
							var rookSquares=Chess.getSquaresBetween(Chess.squareFromCoords([edge, backrank]), kingSquare, true);
							var sq;

							for(var i=0; i<rookSquares.length; i++) {
								sq=rookSquares[i];

								if(this.position.board.getSquare(sq)===Piece.getPiece(Chess.ROOK, colour)) {
									rookSquare=sq;

									break;
								}
							}
						}

						/*
						this bit finds out which squares to check to see that the only 2 pieces
						on the bit of the back rank used for castling are the king and the rook
						*/

						if(rookSquare!==null) {
							var kingDestination=Chess.squareFromCoords([kingDestinationFile, backrank]);
							var rookDestination=Chess.squareFromCoords([rookDestinationFile, backrank]);

							var outermostSquare=kingSquare;
							var innermostSquare=rookSquare;

							var kingFile=Chess.xFromSquare(kingSquare);
							var rookFile=Chess.xFromSquare(rookSquare);

							if(Math.abs(edge-rookDestinationFile)>Math.abs(edge-kingFile)) { //rook dest is further out
								outermostSquare=rookDestination;
							}

							if(Math.abs(edge-kingDestinationFile)<Math.abs(edge-rookFile)) { //king dest is further in
								innermostSquare=kingDestination;
							}

							var squares=Chess.getSquaresBetween(innermostSquare, outermostSquare, true);

							var kings=0;
							var rooks=0;
							var others=0;
							var pc;

							for(var i=0; i<squares.length; i++) {
								sq=squares[i];
								pc=this.position.board.getSquare(sq);

								if(pc!==Chess.SQ_EMPTY) {
									if(pc===Piece.getPiece(Chess.ROOK, colour)) {
										rooks++;
									}

									else if(pc===Piece.getPiece(Chess.KING, colour)) {
										kings++;
									}

									else {
										others++;

										break;
									}
								}
							}

							if(kings===1 && rooks===1 && others===0) {
								var throughCheck=false;
								var between=Chess.getSquaresBetween(kingSquare, kingDestination);
								var n;

								for(var i=0; i<between.length; i++) {
									n=between[i];

									if(Chess.getAllAttackers(this.position.board.getBoardArray(), n, oppColour).length>0) {
										throughCheck=true;

										break;
									}
								}

								if(!throughCheck) {
									move.isValid=true;
									label.piece="";
									label.to="";
									label.special=CastlingDetails.signs[side];
									move.boardChanges[kingSquare]=Chess.SQ_EMPTY;
									move.boardChanges[rookSquare]=Chess.SQ_EMPTY;
									move.boardChanges[kingDestination]=Piece.getPiece(Chess.KING, colour);
									move.boardChanges[rookDestination]=Piece.getPiece(Chess.ROOK, colour);
								}
							}
						}
					}
				}

				else {
					if(piece.type===Chess.KING && isUnobstructed) {
						var castling=new CastlingDetails(from, to);

						if(castling.isValid && this.position.castlingRights.get(colour, castling.Side)) {
							var throughCheck=false;
							var between=Chess.getSquaresBetween(from, to);

							for(var i=0; i<between.length; i++) {
								if(Chess.getAllAttackers(
									this.position.board.getBoardArray(),
									between[i],
									oppColour
								).length>0) {
									throughCheck=true;

									break;
								}
							}

							if(!Chess.isBlocked(
								this.position.board.getBoardArray(),
								from,
								castling.rookStartPos
							) && !throughCheck) {
								move.isValid=true;
								label.piece="";
								label.to="";
								label.special=castling.sign;
								move.boardChanges[from]=Chess.SQ_EMPTY;
								move.boardChanges[to]=Piece.getPiece(Chess.KING, colour);
								move.boardChanges[castling.rookStartPos]=Chess.SQ_EMPTY;
								move.boardChanges[castling.rookEndPos]=Piece.getPiece(Chess.ROOK, colour);
							}
						}
					}
				}
			}

			if(move.isValid) {
				var action;

				for(var square in move.boardChanges) {
					square=parseInt(square);
					this.position.board.setSquare(square, move.boardChanges[square]);
				}

				//test whether the player is in check on temporary board

				var playerKingAttackers=Chess.getAllAttackers(
					this.position.board.getBoardArray(),
					this.position.board.kingPositions[colour],
					oppColour
				);

				if(playerKingAttackers.length===0) {
					move.isLegal=true;
				}
			}

			if(move.isLegal) {
				if(colour===Piece.BLACK) {
					this.position.fullmove++;
				}

				this.position.active=oppColour;

				if(move.capturedPiece!==null || piece.type===Chess.PAWN) {
					this.position.fiftymoveClock=0;
				}

				else {
					this.position.fiftymoveClock++;
				}

				if(piece.type!==Chess.PAWN || !Chess.isDoublePawnMove(relFrom, relTo)) {
					this.position.epTarget=null;
				}

				if(piece.type===Chess.KING || move.isCastling) {
					for(file=0; file<8; file++) {
						this.position.castlingRights.setByFile(colour, file, false);
					}
				}

				else if(piece.type===Chess.ROOK) {
					this.position.castlingRights.setByFile(colour, Chess.xFromSquare(from), false);
				}

				if(this.isInCheck(oppColour)) {
					label.check=MoveLabel.SIGN_CHECK;
				}

				if(this.isMated(oppColour)) {
					label.check=MoveLabel.SIGN_MATE;
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

						/*
						moves available will sometimes return 0 in bughouse games, e.g.
						when the player would be mated normally but can wait to put a
						piece in the way, so stalemate by being unable to move has been
						left out for bughouse.
						*/

						if(this.countLegalMoves(oppColour)===0 && this.type!==GAME_TYPE_BUGHOUSE) {
							this._gameOver(RESULT_DRAW, RESULT_DETAILS_STALEMATE);
						}

						if(this.position.fiftymoveClock>49) {
							this.fiftymoveClaimable=true;
						}

						this._checkThreefold(); //FIXME move isn't in the history yet so this is 1 move behind
					}

					move.resultingFen=this.position.getFen();
					move.setLabel(label);

					if(this.history.move(move)) {
						move.success=true;

						this.Moved.fire();
					}
				}

				if(dryrun || !move.success) {
					this.position=oldPosition;
				}
			}
		}

		return move;
	}

	Game.prototype.isInCheck=function(colour) {
		return (Chess.getAllAttackers(
			this.position.board.getBoardArray(),
			this.position.kingPositions[colour],
			Chess.getOppColour(colour)
		).length>0);
	}

	Game.prototype.isMated=function(colour) {
		return (this.isInCheck(colour) && this.countLegalMoves(colour)===0);
	}

	Game.prototype.canMate=function(colour) {
		var pieces=[];
		var bishops=[];
		var knights=[];

		pieces[Chess.KNIGHT]=0;
		pieces[Chess.BISHOP]=0;
		bishops[Piece.WHITE]=0;
		bishops[Piece.BLACK]=0;
		knights[Piece.WHITE]=0;
		knights[Piece.BLACK]=0;

		var piece, pieceColour, pieceType;

		for(var square=0; square<64; square++) {
			piece=new Piece(this.position.board.getSquare(square));

			if(piece.type!==Chess.SQ_EMPTY && piece.type!==Chess.KING) {
				if(piece.colour===colour && (piece.type===Chess.PAWN || piece.type===Chess.ROOK || piece.type===Chess.QUEEN)) {
					return true;
				}

				if(piece.type===Chess.BISHOP) {
					bishops[piece.colour]++;
					pieces[Chess.BISHOP]++;
				}

				if(piece.type===Chess.KNIGHT) {
					knights[piece.colour]++;
					pieces[Chess.KNIGHT]++;
				}
			}
		}

		return (
			(bishops[Piece.WHITE]>0 && bishops[Piece.BLACK]>0)
			|| (pieces[Chess.BISHOP]>0 && pieces[Chess.KNIGHT]>0)
			|| (pieces[Chess.KNIGHT]>2 && knights[colour]>0)
		);
	}

	Game.prototype.undo=function() {
		this.history.undo();
	}

	Game.prototype._checkTime=function(colour) {
		if(this.time[colour]<1) {
			var oppColour=Chess.getOppColour(colour);
			var result=this.canMate(oppColour)?oppColour:DRAW;
			this._gameOver(result, RESULT_DETAILS_TIMEOUT);
		}
	}

	Game.prototype._calculateTime=function() {
		/*
		LiveGame implements this with stuff about the server time
		diff etc.  No point implementing it here yet.
		*/
	}

	Game.prototype._checkThreefold=function() {
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

	Game.prototype._gameOver=function(result, result_details) {
		this.state=GAME_STATE_FINISHED;
		this.result=result;
		this.resultDetails=result_details;
		this.drawOffered=false;
	}

	return Game;
});
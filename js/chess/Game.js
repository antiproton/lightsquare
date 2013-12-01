function Game(board, history, piecesTaken, clock) {
	IEventHandlerLogging.implement(this);

	this.Moved=new Event(this);

	//what moves the user can make on the game (any colour; only the colour they're playing; none)

	this._userControl=Game.USER_CONTROL_ALL;
	this._userColour=WHITE;

	this.owner=null;
	this.white=null;
	this.black=null;
	this.state=GAME_STATE_PREGAME;
	this.fen=null;
	this.mtimeStart=null;
	this.mtimeFinish=null;
	this.type=GAME_TYPE_STANDARD;
	this.variant=VARIANT_STANDARD;
	this.subvariant=SUBVARIANT_NONE;
	this.bughouseOtherGame=null;
	this.format=GAME_FORMAT_QUICK;
	this.result=null;
	this.resultDetails=null;
	this.whiteRatingOld=null;
	this.whiteRatingNew=null;
	this.blackRatingOld=null;
	this.blackRatingNew=null;
	this.clockStartIndex=1;
	this.clockStartDelay=0;
	this.timingInitial=600;
	this.timingIncrement=0;
	this.timingStyle=TIMING_SUDDEN_DEATH;
	this.timingOvertime=false;
	this.timingOvertimeCutoff=40;
	this.timingOvertimeIncrement=600;
	this.eventType=EVENT_TYPE_CASUAL;
	this.event=null;
	this.round=1;
	this.threefoldClaimable=false;
	this.fiftymoveClaimable=false;
	this.drawOffered=null;
	this.undoRequested=false;
	this.undoGranted=false;
	this.rated=true;

	this.position=new Position();
	this.startingPosition=new Position();

	/*
	pass in the Board, History etc if necessary (usually if using
	LiveHistory, UiBoard etc).  otherwise standard ones will be
	created.
	*/

	this.board=board||new Board();
	this.history=history||new History();
	this.clock=clock||new Clock();

	/*
	pieces taken - there is one for each colour (it can be the same one)
	*/

	if(is_array(piecesTaken)) {
		this.piecesTaken=piecesTaken;
	}

	else if(piecesTaken) {
		this.piecesTaken=[piecesTaken, piecesTaken];
	}

	else {
		this.piecesTaken=[null, null];
	}

	for(var i=0; i<this.piecesTaken.length; i++) {
		if(this.piecesTaken[i]===null) {
			this.piecesTaken[i]=new PiecesTaken();
		}
	}

	this.history.SelectedMoveChanged.AddHandler(this, function(data) {
		if(!this.history.bulkUpdate) { //FIXME this seems wrong (checking it from out here as opposed to history not firing the update)
			if(data.move!==null) {
				this.position.setFen(data.move.fen);
				this.board.setFen(data.move.fen);
			}

			else {
				this.position.setFen(this.startingPosition.getFen());
				this.board.setBoard(this.startingPosition.board);
			}
		}
	});

	this._initProps();
}

Game.USER_CONTROL_ALL=0;
Game.USER_CONTROL_PLAYER=1;
Game.USER_CONTROL_NONE=2;

Game.prototype._initProps=function() { //FIXME probs get rid of this anyway
	this.userColour=new Property(this, function() {
		return this._userColour;
	}, function(value) {
		this._userColour=value;
	});

	this.userControl=new Property(this, function() {
		return this._userControl;
	}, function(value) {
		this._userControl=value;
	});
}

Game.prototype.setStartingFen=function(fen) {
	this.startingPosition.setFen(fen);
	this.setFen(fen);
}

Game.prototype.setFen=function(fen) {
	this.history.clear();
	this.position.setFen(fen);
	this.board.setFen(fen);
	this.history.startingColour.set(this.position.active);
	this.history.startingFullmove.set(this.position.Fullmove);
}

Game.prototype.check_time=function(colour) {
	if(this.time[colour]<1) {
		var oppColour=Util.opp_colour(colour);
		var result=this._canMate(oppColour)?oppColour:DRAW;
		this._gameOver(result, RESULT_DETAILS_TIMEOUT);
	}
}

Game.prototype._calculateTime=function() {
	/*
	LiveGame implements this with stuff about the server time
	diff etc.  No point implementing it here yet.
	*/
}

Game.prototype.checkThreefold=function() {
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

Game.prototype.countLegalMoves=function(colour) {
	var legalMoves=0;
	var piece, available;

	for(var sq=0; sq<this.position.board.length; sq++) {
		piece=this.position.board[sq];

		if(piece!==SQ_EMPTY && Util.colour(piece)===colour) {
			available=Util.moves_available(Util.type(piece), sq, colour);

			for(var n=0; n<available.length; n++) {
				if(this.move(sq, available[n], QUEEN, true).legal) {
					legalMoves++;
				}
			}
		}
	}

	return legalMoves;
}

/*
get a list of legal move destination squares from the specified from-square

TODO check whether this works with 960 castling. probably does.
*/

Game.prototype.GetLegalMovesFrom=function(sq) {
	var legalMoves=[];
	var available;
	var piece=this.position.board[sq];

	if(piece!==SQ_EMPTY) {
		available=Util.moves_available(Util.type(piece), sq, Util.colour(piece));

		for(var n=0; n<available.length; n++) {
			if(this.move(sq, available[n], QUEEN, true).legal) {
				legalMoves.push(available[n]);
			}
		}
	}

	return legalMoves;
}

Game.prototype.move=function(from, to, promoteTo, dryrun) {
	promoteTo=promoteTo||QUEEN;
	dryrun=dryrun||false;

	var colour=this.position.active;
	var piece=new Piece(this.position.board[from]);
	var targetPiece=new Piece(this.position.board[to]);
	var move=this.history.createMove();

	move.from=from;
	move.to=to;

	if(Util.isOnBoard(from) && Util.isOnBoard(to) && piece.type!==SQ_EMPTY && piece.colour===colour) {
		var label=new MoveLabel();
		var position=new Position(this.position.getFen());
		var fromCoords=Util.sq_to_coords(from);
		var toCoords=Util.sq_to_coords(to);
		var relativeFrom=Util.rel_sq_no(from, colour);
		var relativeTo=Util.rel_sq_no(to, colour);
		var oppColour=Util.opp_colour(colour);
		var isUnobstructed=(!Util.blocked(this.position.board, from, to) && (targetPiece.type===SQ_EMPTY || targetPiece.colour!==colour));

		label.piece=Fen.piece_char[Util.piece(piece.type, WHITE)];
		label.to=Util.alg_sq(to);

		if(piece.type!==PAWN && piece.type!==KING) {
			label.disambiguation=Util.disambiguate(this.position.board, piece.type, colour, from, to);
		}

		if(targetPiece.colour===oppColour && targetPiece.type!==SQ_EMPTY) {
			label.sign=SIGN_CAPTURE;
			move.capturedPiece=this.position.board[to];
		}

		if(Util.isRegularMove(piece.type, fromCoords, toCoords) && isUnobstructed) {
			move.isValid=true;
			move.boardChanges[from]=SQ_EMPTY;
			move.boardChanges[to]=this.position.board[from];
		}

		else if(piece.type===PAWN && isUnobstructed) {
			var capturing=Util.isPawnCapture(relativeFrom, relativeTo);
			var validPromotion=false;
			var promotion=false;

			if(capturing) {
				label.disambiguation=Util.file_str(from);
				label.sign=SIGN_CAPTURE;
			}

			label.piece="";

			if(Util.isPawnPromotion(relativeTo)) {
				promotion=true;

				if(promoteTo>=KNIGHT && promoteTo<=QUEEN) {
					move.boardChanges[to]=Util.piece(promoteTo, colour);
					label.special=SIGN_PROMOTE+Fen.piece_char[Util.piece(promoteTo, WHITE)];
					move.promoteTo=promoteTo;
					validPromotion=true;
				}
			}

			if(validPromotion || !promotion) {
				if(targetPiece.type===SQ_EMPTY) {
					if(Util.isDoublePawnMove(relativeFrom, relativeTo)) {
						position.epTarget=Util.rel_sq_no(relativeTo-8, colour); //FIXME should be clearer that this is getting the absolute square from a relative square
						move.isValid=true;
					}

					else if(Util.pawn_move(relativeFrom, relativeTo)) {
						move.isValid=true;
					}

					else if(capturing && to===this.position.epTarget) {
						move.boardChanges[Util.ep_pawn(from, to)]=SQ_EMPTY;
						label.sign=SIGN_CAPTURE;
						move.capturedPiece=Util.piece(PAWN, oppColour);
						move.isValid=true;
					}
				}

				else if(capturing) {
					move.isValid=true;
				}
			}

			if(move.isValid) {
				move.boardChanges[from]=SQ_EMPTY;

				if(!promotion) {
					move.boardChanges[to]=this.position.board[from];
				}
			}
		}

		else if((piece.type===KING || piece.type===ROOK) && !this.isInCheck(colour)) {
			move.isCastling=true;

			/*
			standard and 960 castling are different enough that it is worth having them
			completely separate.

			the default block now contains the original standard chess castling code.
			*/

			if(this.variant===VARIANT_960) {
				var backrank=[0, 7][colour];

				if(Util.y(from)===backrank && Util.y(to)===backrank) {
					/*
					blocked - get furthest in and furthest out squares out of the king/rook
					start/end positions - there can't be anything but the king and rook
					between them (inclusive)
					*/

					/*
					through check - king start, king end and anything between
					*/

					king_sq=this.position.kings[colour];
					rook_sq=null;

					//find out whether it's kingside or queenside based on move direction

					var side;

					if(piece.type===ROOK) {
						side=(Util.x(from)<Util.x(to))?QUEENSIDE:KINGSIDE;
					}

					else if(piece.type===KING) {
						side=(Util.x(from)>Util.x(to))?QUEENSIDE:KINGSIDE;
					}

					var rook_dest_file=[5, 3][side];
					var king_dest_file=[6, 2][side];
					var edge=[7, 0][side];

					//if king move, look for the rook between the edge and the king

					if(piece.type===ROOK) {
						rook_sq=from;
					}

					else {
						var rook_squares=Util.squares_between(Util.coords_to_sq([edge, backrank]), king_sq, true);
						var sq;

						for(var i=0; i<rook_squares.length; i++) {
							sq=rook_squares[i];

							if(this.position.board[sq]===Util.piece(ROOK, colour)) {
								rook_sq=sq;

								break;
							}
						}
					}

					/*
					this bit finds out which squares to check to see that the only 2 pieces
					on the bit of the back rank used for castling are the king and the rook
					*/

					if(rook_sq!==null) {
						var king_dest_sq=Util.coords_to_sq([king_dest_file, backrank]);
						var rook_dest_sq=Util.coords_to_sq([rook_dest_file, backrank]);

						var outermost_sq=king_sq;
						var innermost_sq=rook_sq;

						var king_file=Util.x(king_sq);
						var rook_file=Util.x(rook_sq);

						if(Math.abs(edge-rook_dest_file)>Math.abs(edge-king_file)) { //rook dest is further out
							outermost_sq=rook_dest_sq;
						}

						if(Math.abs(edge-king_dest_file)<Math.abs(edge-rook_file)) { //king dest is further in
							innermost_sq=king_dest_sq;
						}

						var squares=Util.squares_between(innermost_sq, outermost_sq, true);

						var kings=0;
						var rooks=0;
						var others=0;
						var pc;

						for(var i=0; i<squares.length; i++) {
							sq=squares[i];
							pc=this.position.board[sq];

							if(pc!==SQ_EMPTY) {
								if(pc===Util.piece(ROOK, colour)) {
									rooks++;
								}

								else if(pc===Util.piece(KING, colour)) {
									kings++;
								}

								else {
									others++;

									break;
								}
							}
						}

						if(kings===1 && rooks===1 && others===0) {
							var through_check=false;
							var between=Util.squares_between(king_sq, king_dest_sq);
							var n;

							for(var i=0; i<between.length; i++) {
								n=between[i];

								if(Util.attackers(this.position.board, n, oppColour).length>0) {
									through_check=true;

									break;
								}
							}

							if(!through_check) {
								label.piece="";
								label.to="";
								label.disambiguation=""; //might be a rook castle, in which case disamb. would get added
								label.special=CastlingDetails.signs[side];
								move.boardChanges[king_sq]=SQ_EMPTY;
								move.boardChanges[rook_sq]=SQ_EMPTY;
								move.boardChanges[king_dest_sq]=Util.piece(KING, colour);
								move.boardChanges[rook_dest_sq]=Util.piece(ROOK, colour);
								move.isValid=true;
							}
						}
					}
				}
			}

			else { //standard (could be GAME_TYPE_STANDARD or just null)
				if(piece.type===KING && isUnobstructed) {
					var castling=new CastlingDetails(from, to);

					if(castling.Valid && this.position.castlingRights.Get(colour, castling.Side)) {
						//not blocked or through check

						var through_check=false;
						var between=Util.squares_between(from, to);
						var n;

						for(var i=0; i<between.length; i++) {
							n=between[i];

							if(Util.attackers(this.position.board, n, oppColour).length>0) {
								through_check=true;

								break;
							}
						}

						if(!Util.blocked(this.position.board, from, castling.rookStartPos) && !through_check) {
							label.piece="";
							label.to="";
							label.special=castling.sign;
							move.boardChanges[from]=SQ_EMPTY;
							move.boardChanges[to]=Util.piece(KING, colour);
							move.boardChanges[castling.rookStartPos]=SQ_EMPTY;
							move.boardChanges[castling.rookEndPos]=Util.piece(ROOK, colour);
							move.isValid=true;
						}
					}
				}
			}
		}

		if(move.isValid) {
			var action;

			for(var square in move.boardChanges) {
				square=parseInt(square);
				position.setSquare(square, move.boardChanges[square]);
			}

			//test whether the player is in check on temporary board

			var playerKingAttackers=Util.attackers(position.board, position.kings[colour], oppColour);

			if(playerKingAttackers.length===0) {
				move.isLegal=true;
			}
		}

		if(move.isLegal) {
			//everything until the if dryrun bit is done even if it is a dryrun so it should
			//only modify Position (which will be set back)
			//it needs to do all this so it can check whether it is check, mate etoCoords

			var oldPosition=this.position;

			this.position=pos;

			if(colour===BLACK) {
				this.position.fullmove++;
			}

			this.position.active=oppColour;

			if(move.capturedPiece!==null || piece.type===PAWN) {
				this.position.fiftymoveClock=0;
			}

			else {
				this.position.fiftymoveClock++;
			}

			if(piece.type!==PAWN || !Util.isDoublePawnMove(relativeFrom, relativeTo)) {
				this.position.epTarget=null;
			}

			if(piece.type===KING || move.isCastling) {
				for(file=0; file<8; file++) {
					this.position.castlingRights.set(colour, file, false, CastlingRights.MODE_FILE);
				}
			}

			else if(piece.type===ROOK) {
				this.position.castlingRights.set(colour, Util.x(from), false, CastlingRights.MODE_FILE);
			}

			if(this.isInCheck(oppColour)) {
				label.Check=SIGN_CHECK;
			}

			if(this.isMated(oppColour)) {
				label.Check=SIGN_MATE;
			}

			if(dryrun) {
				this.position=oldPosition;
			}

			else {
				this.drawOffered=null; //FIXME using WHITE/BLACK/null for this .. call it "drawOfferedBy" or something?
				this.undoRequested=false;

				if(this.isMated(oppColour)) {
					this._gameOver(Result.WinResult[colour], RESULT_DETAILS_CHECKMATE);
				}

				else {
					//games are automatically drawn only if mate is impossible, not if it's just not forceable.

					if(!this._canMate(WHITE) && !this._canMate(BLACK)) {
						this._gameOver(RESULT_DRAW, RESULT_DETAILS_INSUFFICIENT);
					}

					/*
					moves available will sometimes return 0 in bughouse games, e.g.
					when the player would be mated normally but can wait to put a
					piece in the way, so stalemate by being unable to move has been
					left out for bughouse.  obviously the best way would be to also
					check whether it's possible that pieces will become available,
					but that's too much of a performance hit (on the server at least).
					*/

					if(this.countLegalMoves(oppColour)===0 && this.type!==GAME_TYPE_BUGHOUSE) {
						this._gameOver(RESULT_DRAW, RESULT_DETAILS_STALEMATE);
					}

					if(this.position.fiftymoveClock>49) {
						this.fiftymoveClaimable=true;
					}

					this.checkThreefold();
				}

				move.resultingFen=this.position.getFen();

				if(this.history.move(move)) {
					move.success=true;
					this.Moved.fire();
				}

				else { //if adding to the history fails for some reason, set back to the original position
					this.position=oldPosition;
				}
			}
		}
	}

	return move;
}

Game.prototype.isInCheck=function(colour) {
	return (Util.attackers(this.position.board, this.position.kings[colour], Util.opp_colour(colour)).length>0);
}

Game.prototype.isMated=function(colour) {
	return (this.isInCheck(colour) && this.countLegalMoves(colour)===0);
}

Game.prototype._canMate=function(colour) {
	var pieces=[];

	pieces[KNIGHT]=0;
	pieces[BISHOP]=0;

	var bishops=[];
	var knights=[];

	bishops[WHITE]=0;
	bishops[BLACK]=0;
	knights[WHITE]=0;
	knights[BLACK]=0;

	var piece, pieceColour, pieceType;

	for(var sq=0; sq<this.position.board.length; sq++) {
		piece=this.position.board[sq];
		pieceColour=Util.colour(piece);
		pieceType=Util.type(piece);

		if(pieceType!==SQ_EMPTY && pieceType!==KING) {
			if(pieceColour===colour && (pieceType===PAWN || pieceType===ROOK || pieceType===QUEEN)) {
				return true;
			}

			if(pieceType===BISHOP) {
				bishops[pieceColour]++;
			}

			if(pieceType===KNIGHT) {
				knights[pieceColour]++;
			}

			pieces[pieceType]++;
		}
	}

	if((bishops[WHITE]>0 && bishops[BLACK]>0) || (pieces[BISHOP]>0 && pieces[KNIGHT]>0) || (pieces[KNIGHT]>2 && knights[colour]>0)) {
		return true;
	}

	return false;
}

Game.prototype.undo=function() {
	this.history.undo();
}

Game.prototype.canSelectPiece=function(sq) {
	var pc=this.board.getSquare(sq);
	var colour=Util.colour(pc);

	if(this._userControl===Game.USER_CONTROL_NONE || this.position.active!==colour) {
		return false;
	}

	if(this._userControl===Game.USER_CONTROL_PLAYER && colour!==this._userColour) {
		return false;
	}

	var legalMoves=0;
	var available;

	if(pc!==SQ_EMPTY) {
		available=Util.moves_available(Util.type(pc), sq, colour);

		for(var n=0; n<available.length; n++) {
			if(this.move(sq, available[n], QUEEN, true).isLegal) {
				legalMoves++;
			}
		}
	}

	if(legalMoves===0) {
		return false;
	}

	return true;
}

Game.prototype._gameOver=function(result, result_details) {
	this.state=GAME_STATE_FINISHED;
	this.result=result;
	this.resultDetails=result_details;
	this.drawOffered=null;
	this.undoGranted=false;
	this.undoRequested=false;
}
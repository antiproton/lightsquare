function IGameCommon(board, history, pieces_taken, clock) {
	IEventHandlerLogging.implement(this);

	this.Moved=new Event(this);

	//what moves the user can make on the game (any colour; only the colour they're playing; none)

	this.user_control=IGameCommon.USER_CONTROL_ALL;
	this.user_colour=WHITE;

	this.Owner=null;
	this.White=null;
	this.Black=null;
	this.State=GAME_STATE_PREGAME;
	this.Fen=null;
	this.MtimeStart=null;
	this.MtimeFinish=null;
	this.Type=GAME_TYPE_STANDARD;
	this.Variant=VARIANT_STANDARD;
	this.Subvariant=SUBVARIANT_NONE;
	this.BughouseOtherGame=null;
	this.Format=GAME_FORMAT_QUICK;
	this.Result=null;
	this.ResultDetails=null;
	this.WhiteRatingOld=null;
	this.WhiteRatingNew=null;
	this.BlackRatingOld=null;
	this.BlackRatingNew=null;
	this.ClockStartIndex=1;
	this.ClockStartDelay=0;
	this.TimingInitial=600;
	this.TimingIncrement=0;
	this.TimingStyle=TIMING_SUDDEN_DEATH;
	this.TimingOvertime=false;
	this.TimingOvertimeCutoff=40;
	this.TimingOvertimeIncrement=600;
	this.EventType=EVENT_TYPE_CASUAL;
	this.Event=null;
	this.Round=1;
	this.ThreefoldClaimable=false;
	this.FiftyMoveClaimable=false;
	this.DrawOffered=null;
	this.UndoRequested=false;
	this.UndoGranted=false;
	this.Rated=true;

	this.Position=new Position();
	this.StartingPosition=new Position();

	/*
	pass in the Board, History etc if necessary (usually if using
	LiveHistory, UiBoard etc).  otherwise standard ones will be
	created.
	*/

	this.Board=board||new Board();
	this.History=history||new History();
	this.Clock=clock||new Clock();

	/*
	pieces taken - there is one for each colour (it can be the same one)
	*/

	if(is_array(pieces_taken)) {
		this.PiecesTaken=pieces_taken;
	}

	else if(pieces_taken) {
		this.PiecesTaken=[pieces_taken, pieces_taken];
	}

	else {
		this.PiecesTaken=[null, null];
	}

	for(var i=0; i<this.PiecesTaken.length; i++) {
		if(this.PiecesTaken[i]===null) {
			this.PiecesTaken[i]=new PiecesTaken();
		}
	}

	this.History.SelectedMoveChanged.AddHandler(this, function(data) {
		if(!this.History.BulkUpdate) {
			if(data.Move!==null) {
				this.Position.SetFen(data.Move.Fen);
				this.Board.SetFen(data.Move.Fen);
			}

			else {
				this.Position.SetFen(this.StartingPosition.GetFen());
				this.Board.SetBoard(this.StartingPosition.Board);
			}
		}
	});

	this.init_props();
}

IGameCommon.USER_CONTROL_ALL=0;
IGameCommon.USER_CONTROL_PLAYER=1;
IGameCommon.USER_CONTROL_NONE=2;

IGameCommon.prototype.init_props=function() {
	this.UserColour=new Property(this, function() {
		return this.user_colour;
	}, function(value) {
		this.user_colour=value;
	});

	this.UserControl=new Property(this, function() {
		return this.user_control;
	}, function(value) {
		this.user_control=value;
	});
}

IGameCommon.prototype.SetStartingFen=function(fen) {
	this.StartingPosition.SetFen(fen);
	this.SetFen(fen);
}

IGameCommon.prototype.SetFen=function(fen) {
	this.History.Clear();
	this.Position.SetFen(fen);
	this.Board.SetFen(fen);
	this.History.StartingColour.Set(this.Position.Active);
	this.History.StartingFullmove.Set(this.Position.Fullmove);
}

IGameCommon.prototype.check_time=function(colour) {
	if(this.time[colour]<1) {
		var opp_colour=Util.opp_colour(colour);
		var result=this.sufficient_mating_material(opp_colour)?opp_colour:DRAW;
		this.game_over(result, RESULT_DETAILS_TIMEOUT);
	}
}

IGameCommon.prototype.calculate_time=function() {
	/*
	LiveGame implements this with stuff about the server time
	diff etc.  No point implementing it here yet.
	*/
}

IGameCommon.prototype.CheckThreefold=function() {
	var fen=this.Position.GetFen();
	var limit=3;
	var n=0;

	if(fen===this.StartingPosition.GetFen()) {
		limit--;
	}

	this.History.MainLine.Line.Each(function(move) {
		if(move.Fen===fen) {
			n++;
		}
	});

	this.threefold_claimable=(n>=limit);
}

IGameCommon.prototype.CountLegalMoves=function(colour) {
	var legal_moves=0;
	var piece, available;

	for(var sq=0; sq<this.Position.Board.length; sq++) {
		piece=this.Position.Board[sq];

		if(piece!==SQ_EMPTY && Util.colour(piece)===colour) {
			available=Util.moves_available(Util.type(piece), sq, colour);

			for(var n=0; n<available.length; n++) {
				if(this.Move(sq, available[n], QUEEN, true).Legal) {
					legal_moves++;
				}
			}
		}
	}

	return legal_moves;
}

/*
get a list of legal move destination squares from the specified from-square

TODO check whether this works with 960 castling. probably does.
*/

IGameCommon.prototype.GetLegalMovesFrom=function(sq) {
	var legal_moves=[];
	var available;
	var piece=this.Position.Board[sq];

	if(piece!==SQ_EMPTY) {
		available=Util.moves_available(Util.type(piece), sq, Util.colour(piece));

		for(var n=0; n<available.length; n++) {
			if(this.Move(sq, available[n], QUEEN, true).Legal) {
				legal_moves.push(available[n]);
			}
		}
	}

	return legal_moves;
}

IGameCommon.prototype.Move=function(fs, ts, promote_to, dryrun) {
	promote_to=promote_to||QUEEN;
	dryrun=dryrun||false;

	var colour=this.Position.Active;
	var piece=new Piece(this.Position.Board[fs]);
	var moveto=new Piece(this.Position.Board[ts]);
	var move=new Move();

	move.Fs=fs;
	move.Ts=ts;

	if(Util.on_board(fs) && Util.on_board(ts) && piece.Type!==SQ_EMPTY && piece.Colour===colour) {
		var pos=new Position(this.Position.GetFen());
		var fc=Util.sq_to_coords(fs);
		var tc=Util.sq_to_coords(ts);
		var relfs=Util.rel_sq_no(fs, colour);
		var relts=Util.rel_sq_no(ts, colour);
		var opp_colour=Util.opp_colour(colour);
		var unobstructed=(!Util.blocked(this.Position.Board, fs, ts) && (moveto.Type===SQ_EMPTY || moveto.Colour!==colour));

		move.Label.Piece=Fen.piece_char[Util.piece(piece.Type, WHITE)];
		move.Label.To=Util.alg_sq(ts);

		if(piece.Type!==PAWN && piece.Type!==KING) {
			move.Label.Disambiguation=Util.disambiguate(this.Position.Board, piece.Type, colour, fs, ts);
		}

		if(moveto.Colour===opp_colour && moveto.Type!==SQ_EMPTY) {
			move.Label.Sign=SIGN_CAPTURE;
			move.Capture=this.Position.Board[ts];
		}

		if(Util.regular_move(piece.Type, fc, tc) && unobstructed) {
			move.Valid=true;
			move.Action.push({Sq: fs, Pc: SQ_EMPTY});
			move.Action.push({Sq: ts, Pc: this.Position.Board[fs]});
		}

		else if(piece.Type===PAWN && unobstructed) {
			var capturing=Util.pawn_move_capture(relfs, relts);
			var valid_promotion=false;
			var promotion=false;

			if(capturing) {
				move.Label.Disambiguation=Util.file_str(fs);
				move.Label.Sign=SIGN_CAPTURE;
			}

			move.Label.Piece="";

			if(Util.pawn_move_promote(relts)) {
				promotion=true;

				if(promote_to>=KNIGHT && promote_to<=QUEEN) {
					move.Action.push({Sq: ts, Pc: Util.piece(promote_to, colour)});
					move.Label.Special=SIGN_PROMOTE+Fen.piece_char[Util.piece(promote_to, WHITE)];
					move.PromoteTo=promote_to;
					valid_promotion=true;
				}
			}

			if(valid_promotion || !promotion) {
				if(moveto.Type===SQ_EMPTY) {
					if(Util.pawn_move_double(relfs, relts)) {
						pos.Ep=Util.rel_sq_no(relts-8, colour);
						move.Valid=true;
					}

					else if(Util.pawn_move(relfs, relts)) {
						move.Valid=true;
					}

					else if(capturing && ts===this.Position.Ep) {
						move.Action.push({Sq: Util.ep_pawn(fs, ts), Pc: SQ_EMPTY});
						move.Label.Sign=SIGN_CAPTURE;
						move.Capture=Util.piece(PAWN, opp_colour);
						move.Valid=true;
					}
				}

				else if(capturing) {
					move.Valid=true;
				}
			}

			if(move.Valid) {
				move.Action.push({Sq: fs, Pc: SQ_EMPTY});

				if(!promotion) {
					move.Action.push({Sq: ts, Pc: this.Position.Board[fs]});
				}
			}
		}

		else if((piece.Type===KING || piece.Type===ROOK) && !this.IsInCheck(colour)) {
			move.Castling=true;

			/*
			standard and 960 castling are different enough that it is worth having them
			completely separate.

			the default block now contains the original standard chess castling code.
			*/

			switch(this.Variant) {
				case VARIANT_960: {
					var backrank=[0, 7][colour];

					if(Util.y(fs)===backrank && Util.y(ts)===backrank) {
						/*
						blocked - get furthest in and furthest out squares out of the king/rook
						start/end positions - there can't be anything but the king and rook
						between them (inclusive)
						*/

						/*
						through check - king start, king end and anything between
						*/

						king_sq=this.Position.Kings[colour];
						rook_sq=null;

						//find out whether it's kingside or queenside based on move direction

						var side;

						if(piece.Type===ROOK) {
							side=(Util.x(fs)<Util.x(ts))?QUEENSIDE:KINGSIDE;
						}

						else if(piece.Type===KING) {
							side=(Util.x(fs)>Util.x(ts))?QUEENSIDE:KINGSIDE;
						}

						var rook_dest_file=[5, 3][side];
						var king_dest_file=[6, 2][side];
						var edge=[7, 0][side];

						//if king move, look for the rook between the edge and the king

						if(piece.Type===ROOK) {
							rook_sq=fs;
						}

						else {
							var rook_squares=Util.squares_between(Util.coords_to_sq([edge, backrank]), king_sq, true);
							var sq;

							for(var i=0; i<rook_squares.length; i++) {
								sq=rook_squares[i];

								if(this.Position.Board[sq]===Util.piece(ROOK, colour)) {
									rook_sq=sq;

									break;
								}
							}
						}

						//this bit finds out which squares to check to see that the only 2 pieces
						//on the bit of the back rank used for castling are the king and the rook

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
								pc=this.Position.Board[sq];

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

									if(Util.attackers(this.Position.Board, n, opp_colour).length>0) {
										through_check=true;

										break;
									}
								}

								if(!through_check) {
									move.Label.Piece="";
									move.Label.To="";
									move.Label.Disambiguation=""; //might be a rook castle, in which case disamb. would get added
									move.Label.Special=CastlingDetails.Signs[side];
									move.Action.push({Sq: king_sq, Pc: SQ_EMPTY});
									move.Action.push({Sq: rook_sq, Pc: SQ_EMPTY});
									move.Action.push({Sq: king_dest_sq, Pc: Util.piece(KING, colour)});
									move.Action.push({Sq: rook_dest_sq, Pc: Util.piece(ROOK, colour)});
									move.Valid=true;
								}
							}
						}
					}

					break;
				}

				default: { //standard (could be GAME_TYPE_STANDARD or just null)
					if(piece.Type===KING && unobstructed) {
						var castling=new CastlingDetails(fs, ts);

						if(castling.Valid && this.Position.Castling.Get(colour, castling.Side)) {
							//not blocked or through check

							var through_check=false;
							var between=Util.squares_between(fs, ts);
							var n;

							for(var i=0; i<between.length; i++) {
								n=between[i];

								if(Util.attackers(this.Position.Board, n, opp_colour).length>0) {
									through_check=true;

									break;
								}
							}

							if(!Util.blocked(this.Position.Board, fs, castling.RookStartPos) && !through_check) {
								move.Label.Piece="";
								move.Label.To="";
								move.Label.Special=castling.Sign;
								move.Action.push({Sq: fs, Pc: SQ_EMPTY});
								move.Action.push({Sq: ts, Pc: Util.piece(KING, colour)});
								move.Action.push({Sq: castling.RookStartPos, Pc: SQ_EMPTY});
								move.Action.push({Sq: castling.RookEndPos, Pc: Util.piece(ROOK, colour)});
								move.Valid=true;
							}
						}
					}

					break;
				}
			}
		}

		if(move.Valid) {
			var action;

			for(var i=0; i<move.Action.length; i++) {
				action=move.Action[i];
				pos.SetSquare(action.Sq, action.Pc);
			}

			//test whether the player is in check on temporary board

			var plr_king_attackers=Util.attackers(pos.Board, pos.Kings[colour], opp_colour);

			if(plr_king_attackers.length===0) {
				move.Legal=true;
			}
		}

		if(move.Legal) {
			//everything until the if dryrun bit is done even if it is a dryrun so it should
			//only modify Position (which will be set back)
			//it needs to do all this so it can check whether it is check, mate etc

			var old_pos=this.Position;

			this.Position=pos;

			//increment fullmove

			if(colour===BLACK) {
				this.Position.Fullmove++;
			}

			//switch active colour

			this.Position.Active=opp_colour;

			//50-move

			if(move.Capture!==null || piece.Type===PAWN) {
				this.Position.Clock=0;
			}

			else {
				this.Position.Clock++;
			}

			//ep

			if(piece.Type!==PAWN || !Util.pawn_move_double(relfs, relts)) {
				this.Position.Ep=null;
			}

			/*
			disable castling

			for simplicity this is done in "file" mode (where the file of the rook is given,
			as opposed to KINGSIDE or QUEENSIDE) regardless of variant.  CastlingPrivileges
			knows to disable QUEENSIDE if the file is 0 etc.
			*/

			if(piece.Type===KING || move.Castling) { //might be a rook-based castle (960)
				for(file=0; file<8; file++) {
					this.Position.Castling.Set(colour, file, false, CastlingPrivileges.MODE_FILE);
				}
			}

			else if(piece.Type===ROOK) { //rook move, not castling
				this.Position.Castling.Set(colour, Util.x(fs), false, CastlingPrivileges.MODE_FILE);
			}

			//check/mate

			if(this.IsInCheck(opp_colour)) {
				move.Label.Check=SIGN_CHECK;
			}

			if(this.IsMated(opp_colour)) { //checkmate
				move.Label.Check=SIGN_MATE;
			}

			if(dryrun) {
				this.Position=old_pos;
			}

			else {
				//reject any open draw offers or undo requests

				this.DrawOffered=null;
				this.UndoRequested=false;

				/*
				mate/stalemate
				*/

				if(this.IsMated(opp_colour)) { //checkmate
					this.game_over(Result.WinResult[colour], RESULT_DETAILS_CHECKMATE);
				}

				else {
					//insufficient mating material
					//games are automatically drawn only if mate is impossible, not if it's just not forceable.

					if(!this.can_mate(WHITE) && !this.can_mate(BLACK)) {
						this.game_over(RESULT_DRAW, RESULT_DETAILS_INSUFFICIENT);
					}

					//no moves

					/*
					moves available will sometimes return 0 in bughouse games, e.g.
					when the player would be mated normally but can wait to put a
					piece in the way, so stalemate by being unable to move has been
					left out for bughouse.  obviously the best way would be to also
					check whether it's possible that pieces will become available,
					but that's too much of a performance hit (on the server at least).
					*/

					if(this.CountLegalMoves(opp_colour)===0 && this.Type!==GAME_TYPE_BUGHOUSE) {
						this.game_over(RESULT_DRAW, RESULT_DETAILS_STALEMATE);
					}

					//fifty move

					if(this.Position.Clock>49) {
						this.FiftymoveClaimable=true;
					}

					//threefold

					this.CheckThreefold();
				}

				/*
				add to history
				*/

				move.Fen=this.Position.GetFen();

				if(this.History.Move(move)) {
					move.Success=true;
					this.Moved.Fire();
				}

				else { //if adding to the history fails for some reason, set back to the original position
					this.Position=old_pos;
				}
			}
		}
	}

	return move;
}

IGameCommon.prototype.IsInCheck=function(colour, pos) {
	return (Util.attackers(this.Position.Board, this.Position.Kings[colour], Util.opp_colour(colour)).length>0);
}

IGameCommon.prototype.IsMated=function(colour, pos) {
	return (this.IsInCheck(colour) && this.CountLegalMoves(colour)===0);
}

IGameCommon.prototype.can_mate=function(colour) {
	var pieces=[];

	pieces[KNIGHT]=0;
	pieces[BISHOP]=0;

	var bishops=[0, 0]; //NOTE indexed by colour
	var knights=[0, 0];

	var piece, piece_colour, piece_type;

	for(var sq=0; sq<this.Position.Board.length; sq++) {
		piece=this.Position.Board[sq];
		piece_colour=Util.colour(piece);
		piece_type=Util.type(piece);

		if(piece_type!==SQ_EMPTY && piece_type!==KING) {
			if(piece_colour===colour && (piece_type===PAWN || piece_type===ROOK || piece_type===QUEEN)) {
				return true;
			}

			if(piece_type===BISHOP) {
				bishops[piece_colour]++;
			}

			if(piece_type===KNIGHT) {
				knights[piece_colour]++;
			}

			pieces[piece_type]++;
		}
	}

	if((bishops[WHITE]>0 && bishops[BLACK]>0) || (pieces[BISHOP]>0 && pieces[KNIGHT]>0) || (pieces[KNIGHT]>2 && knights[colour]>0)) {
		return true;
	}

	return false;
}

IGameCommon.prototype.Undo=function() {
	this.History.Undo();
}

IGameCommon.prototype.game_over=function(result, result_details) {
	this.State=GAME_STATE_FINISHED;
	this.Result=result;
	this.ResultDetails=result_details;
	this.DrawOffered=null;
	this.UndoGranted=false;
	this.UndoRequested=false;
}
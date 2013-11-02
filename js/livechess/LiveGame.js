/*
NOTE update logic - what to do when the state changes, either from a
server update or a user action - is spread out everywhere and not coded
very sensibly or semantically.  Could do with a lot of refactoring.
*/

function LiveGame(table, gid, board, history, pieces_taken, clock) {
	this.Table=table;
	this.Gid=gid;

	__GAME__=this; //DEBUG this can be taken out, was just for easy access from dev console

	/*
	freeze the time of the player who has just moved so that it doesn't jump up
	or down on the next calculation.  when the player becomes active again -
	if the calculated time is above the frozen time it will wait a bit; if below
	then it will just display the calculated time immediately.
	*/

	this.user_has_moved=false;
	this.time_remaining_at_last_move=0;

	/*
	record how long the last move xhr took to get some compensation for
	network and processing overhead.

	NOTE everyone starts with a default value of half a second for the first
	move.
	*/

	this.last_move_round_trip_time=0.5*MSEC_PER_SEC;

	IGameCommon.implement(this, board, history, pieces_taken, clock);

	this.BughousePiecesAvailable=[null, null];

	this.Board.PromoteDialog.Hide();
	this.Board.GameOverDialog.Hide();

	this.UnhiliteLastMove();

	this.clock_running=false;

	this.History.SelectedMoveChanged.AddHandler(this, function() {
		this.update_lastmove_hilite();

		/*
		NOTE IGameCommon adds a handler for this to set the board position to
		the current selected move, so the premoves are applied here.

		This relies on the event handler execution order.
		*/

		this.update_premoves();
	});

	this.History.Moved.AddHandler(this, function(data) {
		var move=data.Move;

		this.update_captures(move);
		this.update_bughouse_drops(move);

		if(!this.History.BulkUpdate) {
			this.Position.SetFen(move.Fen); //this will happen again when SelectedMoveChanged fires, but we need it here for the premoves to work

			if(move.Colour===Util.opp_colour(this.user_colour) && Base.App.User.Prefs.AnimateMoves.Get()) {
				var self=this;
				var pos=new Position(this.StartingPosition.GetFen());
				var fs=move.Fs;
				var ts=move.Ts;

				//TODO calculate fs and ts for 960 castling
				//king or rook might be staying where it is...
				//probably best to animate both movements like would happen in real life

				if(move.PreviousMove!==null) {
					pos.SetFen(move.PreviousMove.Fen);
				}

				var piece=pos.Board[fs];

				this.Board.SetSquare(fs, SQ_EMPTY);
				this.Board.SetSquare(ts, SQ_EMPTY);

				this.Board.HtmlUpdatesEnabled.Set(false);

				this.Board.AnimateMove(piece, fs, ts, function() {
					self.Board.HtmlUpdatesEnabled.Set(true);
					self.update_premoves();
				});
			}

			else {
				this.update_premoves();
			}

			this.Moved.Fire();
		}
	});

	//for calculating time (set in init_load):

	this.client_time_at_load=null;
	this.server_time_at_load=null;
	this.estimated_server_time_at_load=null;

	this.ui_is_setup=false;
	this.init_events();

	this.highlight_last_move=Base.App.User.Prefs.HighlightLastMove.Get();

	Base.App.User.Prefs.HighlightLastMoveChanged.AddHandler(this, function(data, sender) {
		this.HighlightLastMove.Set(sender.HighlightLastMove.Get());
	});

	this.IsNew=true;
	this.MtimeLastUpdate=0;

	this.Premoves=new Premoves(this);

	this.Premoves.Update.AddHandler(this, function() {
		this.update_premoves();
	});

	this.Premoves.BeforeUpdate.AddHandler(this, function() {
		this.clear_premove_hilites();
	});

	this.setup_board();
	this.setup_pieces_taken();

	Base.App.UndoAction.AddHandler(this, function() {
		this.UndoPremove();
	});

	/*
	NOTE this is so that if white's first move is a capture (possible for
	custom FEN games), it doesn't get added to the pieces taken twice for white

	(white's history update doesn't start only getting black's moves until after
	initial update)
	*/

	this.last_capture_move_index=-1;

	/*
	last drop move index - as above
	*/

	this.last_drop_move_index=-1;

	this.initial_clock_update_done=false;

	this.init_props();
	this.init_load();
}

LiveGame.MaxGameId={};
LiveGame.MaxGameId[GAME_TYPE_STANDARD]=0;
LiveGame.MaxGameId[GAME_TYPE_BUGHOUSE]=1;

/*
CLOCK_DELAY_AFTER_MOVE - wait this long after moving to
start the opponent's clock running so that it doesn't go
down to next second and then jump back up if they have
premoved or moved quickly.

Hopefully it will be enough to stop jumping in most cases
without being too much of a delay.
*/

LiveGame.CLOCK_DELAY_AFTER_MOVE=100;

/*
set up event handlers to move when the user drags a piece etc,
and set the board to the current position.
*/

LiveGame.prototype.setup_board=function() {
	this.clear_all_hilites();
	this.clear_premove_hilites();
	this.ClearEventHandlers(this.Board);

	this.Board.SelectPiece.AddHandler(this, function(data) {
		/*
		if we're somewhere in the middle of the history, or the game
		isn't in progress, or the piece is the wrong colour, then there
		is no point being able to select the piece.
		*/

		if(
		   (this.History.MainLine.LastMove!==null && this.History.SelectedMove!=this.History.MainLine.LastMove)
		   || this.State!==GAME_STATE_IN_PROGRESS
		   || this.user_control===IGameCommon.USER_CONTROL_NONE
		   || (this.user_control===IGameCommon.USER_CONTROL_PLAYER && this.user_colour!==Util.colour(data.Piece))
		) {
			data.Cancel=true;
		}
	});

	this.Board.PieceSelected.AddHandler(this, function(data) {
		if(this.Board.MoveInfo.Mode===UiBoard.MOVE_MODE_CLICK_CLICK) {
			this.Board.HiliteSelected(data.Sq);
		}
	});

	this.Board.Deselected.AddHandler(this, function() {
		this.Board.UnhiliteSelected();
	});

	this.Board.UserMove.AddHandler(this, function(data) {
		if(this.Position.Active===this.user_colour) {
			this.UserMove(data.From, data.To);
		}

		else {
			if(Base.App.User.Prefs.Premove.Get()) {
				this.UserPremove(data.From, data.To);
			}
		}
	});

	this.Board.SetBoard(this.Position.Board);
	this.update_premoves();
}

LiveGame.prototype.SetBoard=function(board) {
	this.ClearEventHandlers(this.Board);
	this.Board=board;
	this.setup_board();
}

LiveGame.prototype.update_captures=function(move) {
	if(move.Capture!==null) {
		if(move.MoveIndex>this.last_capture_move_index) {
			var colour=Util.colour(move.Capture);

			if(this.PiecesTaken[colour]!==null) {
				this.PiecesTaken[colour].Add(move.Capture);
				this.last_capture_move_index=move.MoveIndex;
			}
		}
	}
}

LiveGame.prototype.update_bughouse_drops=function(move) {
	if(move.Label.Disambiguation===SIGN_BUGHOUSE_DROP) {
		if(move.MoveIndex>this.last_drop_move_index) {
			var colour=Util.colour(move.Piece);

			if(this.BughousePiecesAvailable[colour]!==null) {
				this.BughousePiecesAvailable[colour].Remove(move.Piece);
				this.last_drop_move_index=move.MoveIndex;
			}
		}
	}
}

/*
set the control that the game fills up when capture moves are made

can be null

can also be the pieces available for drop moves on the other bughuouse game
*/

LiveGame.prototype.SetPiecesTaken=function(pieces_taken, colour) {
	this.PiecesTaken[colour]=pieces_taken;
	this.setup_pieces_taken();
}

LiveGame.prototype.setup_pieces_taken=function() {
	//NOTE the table handles clearing

	this.History.MainLine.Line.Each(function(move) {
		this.update_captures(move);
		this.update_bughouse_drops(move);
	}, this);
}

LiveGame.prototype.setup_live_history=function() {
	ILiveHistory.implement(this.History, this.Table, this);

	this.History.Update.AddHandler(this, function() {
		this.update_lastmove_hilite();

		if(!this.initial_clock_update_done) {
			this.UpdateClock();
			this.initial_clock_update_done=true;
		}
	});
}

/*
set the control that the user can drop pieces onto the board from to
do bughouse moves.

can be null

NOTE the control passed to SetBughousePiecesAvailable for one game will
be the same control passed to SetPiecesTaken for the other
*/

LiveGame.prototype.SetBughousePiecesAvailable=function(pieces_available, colour) {
	if(this.Type===GAME_TYPE_BUGHOUSE) {
		if(this.BughousePiecesAvailable[colour]!==null) {
			this.ClearEventHandlers(this.BughousePiecesAvailable[colour]);
		}

		this.BughousePiecesAvailable[colour]=pieces_available;

		if(this.BughousePiecesAvailable[colour]!==null) {
			this.setup_bughouse_pieces_available(colour);
		}
	}
}

LiveGame.prototype.setup_bughouse_pieces_available=function(colour) {
	if(this.Type===GAME_TYPE_BUGHOUSE) {
		this.BughousePiecesAvailable[colour].PieceDropped.AddHandler(this, function(data, sender) {
			if(this.Board.MouseOnBoard(data.Event)) {
				this.UserBughouseMove(data.Piece, this.Board.SqFromMouseEvent(data.Event));
			}

		});

		this.BughousePiecesAvailable[colour].SelectPiece.AddHandler(this, function(data) {
			if(
				(this.History.MainLine.LastMove!==null && this.History.SelectedMove!=this.History.MainLine.LastMove)
				|| this.State!==GAME_STATE_IN_PROGRESS
				|| this.user_control===IGameCommon.USER_CONTROL_NONE
				|| (this.user_control===IGameCommon.USER_CONTROL_PLAYER && this.user_colour!==Util.colour(data.Piece))
				|| this.Position.Active!==this.user_colour
			) {
				data.Cancel=true;
			}
		});

		this.History.MainLine.Line.Each(function(move) {
			this.update_captures(move);
			this.update_bughouse_drops(move);
		}, this);
	}
}

LiveGame.prototype.init_events=function() {
	this.Loaded=new Event(this);
	this.Update=new Event(this);
	this.GameOver=new Event(this);
}

LiveGame.prototype.init_props=function() {
	IGameCommon.prototype.init_props.call(this);

	this.HighlightLastMove=new Property(this, function() {
		return this.highlight_last_move;
	}, function(value) {
		this.highlight_last_move=value;
		this.update_lastmove_hilite();
	});

	this.UserColour=new Property(this, function() {
		return this.user_colour;
	}, function(value) {
		this.user_colour=value;
		this.update_premoves();
	});
}

LiveGame.prototype.UserPremove=function(fs, ts, promote_to) {
	var promotion=false;
	var piece=this.Board.GetSquare(fs);

	//the following looks dodgy because promotion only gets set if promote_to isn't specified, but it doesn't matter

	if(Util.type(piece)===PAWN && (Util.y(ts)===0 || Util.y(ts)===7) && !promote_to) {
		promotion=true;

		if(Base.App.User.Prefs.AutoQueen.Get()) {
			promote_to=QUEEN;
		}

		else {
			this.Board.PromoteDialog.Show();
			this.Board.PromoteDialog.Colour.Set(this.user_colour);

			this.Board.PromoteDialog.PieceSelected.AddHandler(this, function(data) {
				this.UserPremove(fs, ts, data.Piece);
				this.Board.PromoteDialog.Hide();

				return true;
			});
		}
	}

	if(promote_to || !promotion) {
		var move=this.GetPremove(fs, ts, promote_to);

		if(move.Valid) {
			this.Premoves.Add(move);
		}
	}
}

LiveGame.prototype.UndoPremove=function() {
	this.Premoves.Undo();

	if(this.Premoves.List.length===0) {
		this.update_lastmove_hilite();
	}
}

/*
Refresh the ui representation of the current premove line.
*/

LiveGame.prototype.update_premoves=function() {
	var move;

	/*
	set the board to the current actual position
	*/

	this.Board.SetBoard(this.Position.Board);
	this.clear_premove_hilites();

	/*
	delete any premoves with an index below the last move index
	*/


	if(this.History.MainLine.Line.Length>0) {
		while(this.Premoves.List.length>0 && this.Premoves.List[0].MoveIndex<=this.History.MainLine.LastMove.MoveIndex) {
			this.Premoves.List.shift();
		}
	}

	if(this.State===GAME_STATE_IN_PROGRESS) {
		/*
		apply remaining premoves to the board
		*/

		for(var i=0; i<this.Premoves.List.length; i++) {
			move=this.Premoves.List[i];

			if(!this.apply_premove(move.Fs, move.Ts, move.PromoteTo, move.MoveIndex)) {
				break;
			}
		}
	}
}

/*
unhighlight any squares highlighted for premoving
*/

LiveGame.prototype.clear_premove_hilites=function() {
	var move;

	for(var i=0; i<this.Premoves.List.length; i++) {
		move=this.Premoves.List[i];

		this.Board.UnhiliteSq(move.Fs);
		this.Board.UnhiliteSq(move.Ts);
	}
}

/*
apply a premove to the board
*/

LiveGame.prototype.apply_premove=function(fs, ts, promote_to, move_index) {
	var success=false;
	var move=this.GetPremove(fs, ts, promote_to, move_index);

	if(move.Valid) {
		for(var i=0; i<move.Action.length; i++) {
			this.Board.SetSquare(move.Action[i].Sq, move.Action[i].Pc);
		}

		this.Board.HiliteSq(move.Fs, this.Board.HlPremoveFrom);
		this.Board.HiliteSq(move.Ts, this.Board.HlPremoveTo);

		success=true;
	}

	return success;
}

/*
generate a Move to add to the Premoves list.  its Legal will be false;
check Valid to see if it's a valid premove.
*/

LiveGame.prototype.GetPremove=function(fs, ts, promote_to, move_index) {
	promote_to=promote_to||null;
	move_index=is_number(move_index)?move_index:null;

	var piece=new Piece(this.Board.GetSquare(fs));
	var moveto=new Piece(this.Board.GetSquare(ts));
	var colour=this.user_colour;
	var move=new Move();

	/*
	move_index is optional, if not given it will default to the next premove
	index
	*/

	if(move_index===null) {
		move_index=[0, 1][colour];

		if(this.Premoves.List.length>0) {
			move_index=end(this.Premoves.List).MoveIndex+2;
		}

		else if(this.History.MainLine.Line.Length>0) {
			move_index=this.History.MainLine.LastMove.MoveIndex+2;
		}
	}

	move.Fs=fs;
	move.Ts=ts;
	move.MoveIndex=move_index;

	if(Util.on_board(fs) && Util.on_board(ts) && piece.Type!==SQ_EMPTY) {
		/*
		NOTE loads of this code is pretty much duplicated in Move but factoring
		out the logic would probably just overcomplicate things
		*/

		var fc=Util.sq_to_coords(fs);
		var tc=Util.sq_to_coords(ts);
		var relfs=Util.rel_sq_no(fs, colour);
		var relts=Util.rel_sq_no(ts, colour);
		var opp_colour=Util.opp_colour(colour);
		var friendly_obstruction=false;
		var friendly_capture=(moveto.Type!==SQ_EMPTY && moveto.Colour===colour);

		var squares_between=Util.squares_between(fs, ts);
		var pc;

		for(var i=0; i<squares_between.length; i++) {
			pc=this.Board.Board[squares_between[i]];

			if(pc!==SQ_EMPTY && Util.colour(pc)===colour) {
				friendly_obstruction=true;

				break;
			}
		}

		var obstructed=(friendly_obstruction || friendly_capture);

		if(Util.regular_move(piece.Type, fc, tc) && !friendly_obstruction) {
			move.Valid=true;
			move.Action.push({Sq: fs, Pc: SQ_EMPTY});
			move.Action.push({Sq: ts, Pc: this.Board.Board[fs]});
		}

		else if(piece.Type===PAWN && !friendly_obstruction) {
			var capturing=Util.pawn_move_capture(relfs, relts);
			var promotion=false;
			var valid_promotion=false;

			if(Util.pawn_move_promote(relts)) {
				promotion=true;

				if(promote_to!==null && promote_to>=KNIGHT && promote_to<=QUEEN) {
					valid_promotion=true;
					move.PromoteTo=promote_to;
				}
			}

			if(valid_promotion || !promotion) {
				if(Util.pawn_move_double(relfs, relts)) {
					move.Valid=true;
				}

				else if(Util.pawn_move(relfs, relts)) {
					move.Valid=true;
				}

				else if(capturing) {
					move.Valid=true;
				}
			}

			if(move.Valid) {
				move.Action.push({Sq: ts, Pc: (promotion?Util.piece(promote_to, colour):this.Board.Board[fs])});
				move.Action.push({Sq: fs, Pc: SQ_EMPTY});
			}
		}

		else if(piece.Type===KING && !obstructed) {
			var castling=new CastlingDetails(fs, ts);

			if(castling.Valid) {
				move.Valid=true;
				move.Castling=true;
				move.Action.push({Sq: fs, Pc: SQ_EMPTY});
				move.Action.push({Sq: ts, Pc: Util.piece(KING, colour)});
				move.Action.push({Sq: castling.RookStartPos, Pc: SQ_EMPTY});
				move.Action.push({Sq: castling.RookEndPos, Pc: Util.piece(ROOK, colour)});
			}
		}

		else if(this.Variant===VARIANT_960 && (piece.Type===KING || piece.Type===ROOK) && obstructed) {
			move.Castling=true;

			var backrank=[0, 7][colour];

			if(Util.y(fs)===backrank && Util.y(ts)===backrank) {
				var king_sq=null;
				var rook_sq=null;

				//find the king

				var backrank_start=backrank*8;
				var backrank_end=backrank_start+7;

				var king_piece=Util.piece(KING, colour);

				for(var sq=backrank_start; sq<=backrank_end; sq++) {
					if(this.Board.Board[sq]===king_piece) {
						king_sq=sq;

						break;
					}
				}

				//NOTE if king_sq is null here something has gone badly wrong.
				//probably no point even checking for it.  debugging will be more
				//fun that way.

				//find out whether it's kingside or queenside based on move direction

				var side;

				if(piece.Type===ROOK) {
					side=(Util.x(fs)<Util.x(ts))?QUEENSIDE:KINGSIDE;
				}

				else if(piece.Type===KING) {
					side=(Util.x(fs)>Util.x(ts))?QUEENSIDE:KINGSIDE;
				}

				//rook destination files are hardcoded (c or e depending on side)

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

						if(this.Board.Board[sq]===Util.piece(ROOK, colour)) {
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
						pc=this.Board.Board[sq];

						if(pc!==SQ_EMPTY && Util.colour(pc)===colour) {
							if(Util.type(pc)===ROOK) {
								rooks++;
							}

							else if(Util.type(pc)===KING) {
								kings++;
							}

							else {
								others++;

								break;
							}
						}
					}

					if(kings===1 && rooks===1 && others===0) {
						move.Valid=true;
						move.Action.push({Sq: king_sq, Pc: SQ_EMPTY});
						move.Action.push({Sq: rook_sq, Pc: SQ_EMPTY});
						move.Action.push({Sq: king_dest_sq, Pc: Util.piece(KING, colour)});
						move.Action.push({Sq: rook_dest_sq, Pc: Util.piece(ROOK, colour)});
					}
				}
			}
		}
	}

	return move;
}

LiveGame.prototype.clock_pause=function() {
	this.clock_running=false;
}

LiveGame.prototype.clock_start=function() {
	this.clock_running=true;
}

LiveGame.prototype.HiliteLastMove=function() {
	var move=this.History.MainLine.LastMove;

	if(move!==null) {
		//TODO for castling would look better if the king and rook dest squares were highlighted
		//like on chess.com, for both standard and 960 castling

		if(move.Fs!==null) { //bughouse moves
			this.Board.HiliteLastMoveFrom(move.Fs);
		}

		this.Board.HiliteLastMoveTo(move.Ts);
	}
}

LiveGame.prototype.UnhiliteLastMove=function() {
	this.Board.UnhiliteLastMoveFrom();
	this.Board.UnhiliteLastMoveTo();
}

LiveGame.prototype.update_lastmove_hilite=function() {
	if(this.History.SelectedMove===this.History.MainLine.LastMove && this.History.SelectedMove!==null && this.highlight_last_move) {
		this.HiliteLastMove();
	}

	else {
		this.UnhiliteLastMove();
	}
}

/*
NOTE increment and delay are stored in the same thing ("timing_increment").
for increment styles, increment is an increment; for delay styles it's a delay.
*/

LiveGame.prototype.calculate_time=function() {
	var mtime_initial=this.TimingInitial*MSEC_PER_SEC;
	var colours=[WHITE, BLACK];
	var offset;

	var increment=this.TimingIncrement*MSEC_PER_SEC;
	var time=[mtime_initial, mtime_initial];
	var move, thinking_time;
	var clock_start_delay=this.ClockStartDelay*MSEC_PER_SEC;
	var first_timed_move_index=this.ClockStartIndex+1;
	var last_move_index=this.History.MainLine.Line.Length-1;

	if(this.TimingStyle!==TIMING_NONE) {
		var opp_colour=this.StartingPosition.Active;
		var colour=Util.opp_colour(opp_colour);

		if(this.ClockStartIndex===-1 || last_move_index<0) {
			offset=this.MtimeStart+clock_start_delay;
		}

		else if(last_move_index>=this.ClockStartIndex) {
			offset=this.History.MainLine.Line.Item(this.ClockStartIndex).Mtime+clock_start_delay;
		}

		for(var move_index=first_timed_move_index; move_index<this.History.MainLine.Line.Length; move_index++) {
			move=this.History.MainLine.Line.Item(move_index);
			colour=Util.hm_colour(move_index);
			opp_colour=Util.opp_colour(colour);
			thinking_time=move.Mtime-offset;

			/*
			for moves that the user makes, the clock is paused until the response of
			the move xhr comes back (and then if the mtime is earlier than thought, it
			waits as opposed to jumping up) so that the clock doesn't jump around.

			opponent's moves already have their official mtime, so it doesn't matter for
			them.

			code for setting time_remai.. and pausing/unpausing is in UserMove

			this isn't done for hourglass, per move or bronstein delay because
			the time needs to be able to adjust itself after the move with those.
			*/

			if(
			   move===this.History.MainLine.LastMove
			   && (this.Table.PlayerSeat!==null && colour===this.Table.PlayerSeat.Colour)
			   && this.user_has_moved
			   && this.TimingStyle!==TIMING_HOURGLASS
			   && this.TimingStyle!==TIMING_PER_MOVE
			   && this.TimingStyle!==TIMING_BRONSTEIN_DELAY
			) {
				time[colour]=this.time_remaining_at_last_move;

				if(this.TimingStyle===TIMING_FISCHER_AFTER) {
					time[colour]+=increment;
				}
			}

			else {
				switch(this.TimingStyle) {
					case TIMING_FISCHER: {
						time[colour]+=increment-Math.max(0, thinking_time);

						break;
					}

					case TIMING_FISCHER_AFTER: {
						time[colour]+=increment-thinking_time;

						break;
					}

					case TIMING_BRONSTEIN_DELAY: {
						time[colour]+=Math.min(thinking_time, increment)-thinking_time;

						break;
					}

					case TIMING_SIMPLE_DELAY: {
						time[colour]-=Math.max(0, thinking_time-increment);

						break;
					}

					case TIMING_SUDDEN_DEATH: {
						time[colour]-=thinking_time;

						break;
					}

					case TIMING_HOURGLASS: {
						time[colour]-=thinking_time;
						time[opp_colour]+=thinking_time;

						break;
					}

					case TIMING_PER_MOVE: {
						time[colour]-=thinking_time;

						break;
					}
				}
			}

			if(this.TimingOvertime && Util.fullmove(move_index)===this.TimingOvertimeCutoff) {
				time[colour]+=(this.TimingOvertimeIncrement*MSEC_PER_SEC);
			}

			offset=move.Mtime;
		}

		if(last_move_index>this.ClockStartIndex-1) {
			//get an approximation of the current server time

			var now=this.get_est_server_mtime();

			/*
			now-offset will sometimes be negative here, causing brief "increment" to be
			added when the other player moves
			*/

			thinking_time=Math.max(0, now-offset);

			var delay=0;

			if(this.TimingStyle===TIMING_SIMPLE_DELAY) { //bronstein isn't really a delay, more of a variable increment
				delay=increment;
			}

			time[opp_colour]-=Math.max(0, thinking_time-delay);

			if(this.TimingStyle===TIMING_HOURGLASS) {
				time[colour]+=thinking_time;
			}

			if(this.TimingStyle===TIMING_FISCHER) {
				time[opp_colour]+=increment;
			}

			var colour;

			for(var c=0; c<colours.length; c++) {
				colour=colours[c];
				this.Clock.SetMtime(time[colour], colour);

				if(time[colour]<1) {
					this.clock_pause(); //no need to keep doing anything now
				}

				if(this.State===GAME_STATE_IN_PROGRESS && time[colour]<=2*MSEC_PER_SEC && !this.server_time_checked) {
					this.server_check_time();
					this.server_time_checked=true;
				}
			}
		}
	}
}

LiveGame.prototype.server_check_time=function() {
	if(this.Table.PlayerSeat!==null) {
		Xhr.RunQueryAsync(ap("/xhr/check_time.php"), {
			"gid": this.Gid
		});
	}
}

LiveGame.prototype.UpdateClock=function() {
	this.calculate_time();
}

LiveGame.prototype.init_load=function() {
	Xhr.QueryAsync(ap("/xhr/load_game.php"), function(response, round_trip_time) {
		if(response!==false) {
			this.set_row(response);
			this.row=response;
			this.IsNew=false;
			this.start_updates();

			this.Board.SetFen(this.Position.GetFen());

			this.setup_board();
			this.setup_live_history();

			/*
			make an estimate of what the server time is now (add half of the request
			round trip time) and store it for calculating time based on the move mtimes
			(which are server times)
			*/

			this.server_time_at_load=response["server_time"];
			this.client_time_at_load=mtime();
			this.estimated_server_time_at_load=this.server_time_at_load+Math.round(round_trip_time/2);
			this.estimated_server_time_diff=this.estimated_server_time_at_load-this.client_time_at_load;

			this.clock_start();

			this.calculate_time();

			if(this.State===GAME_STATE_IN_PROGRESS) {
				Base.TenthSecTick.AddHandler(this, function() {
					if(this.clock_running) {
						this.calculate_time();
					}
				});
			}

			if(this.State===GAME_STATE_FINISHED) {
				this.game_over(this.Result, this.ResultDetails);
			}

			/*
			NOTE do this at the end - must be after adding all event handlers so that
			the table can catch it and remove them all if the game is over
			*/

			this.Loaded.Fire();
		}
	}, {
		"gid": this.Gid
	}, this);
}

LiveGame.prototype.set_row=function(row) {
	this.Owner=row["owner"];
	this.White=row["white"];
	this.Black=row["black"];
	this.Fen=row["fen"];
	this.MtimeStart=row["mtime_start"];
	this.Type=row["type"];
	this.Variant=row["variant"];
	this.Subvariant=row["subvariant"];
	this.BughouseOtherGame=row["bughouse_other_game"];
	this.Format=row["format"];
	this.WhiteRatingOld=row["white_rating_old"];
	this.WhiteRatingNew=row["white_rating_new"];
	this.BlackRatingOld=row["black_rating_old"];
	this.BlackRatingNew=row["black_rating_new"];
	this.ClockStartIndex=row["clock_start_index"];
	this.ClockStartDelay=row["clock_start_delay"];
	this.TimingInitial=row["timing_initial"];
	this.TimingIncrement=row["timing_increment"];
	this.TimingStyle=row["timing_style"];
	this.TimingOvertime=row["timing_overtime"];
	this.TimingOvertimeCutoff=row["timing_overtime_cutoff"];
	this.TimingOvertimeIncrement=row["timing_overtime_increment"];
	this.EventType=row["event_type"];
	this.Event=row["event"];
	this.Round=row["round"];
	this.Rated=row["rated"];
	this.GameId=row["game_id"];

	if(this.Fen!==null || this.Fen!==FEN_INITIAL) {
		this.StartingPosition.SetFen(this.Fen);
		this.Position.SetFen(this.Fen);
	}

	this.Clock.SetMtime(this.TimingInitial*MSEC_PER_SEC, WHITE);
	this.Clock.SetMtime(this.TimingInitial*MSEC_PER_SEC, BLACK);

	this.update(row);
}

LiveGame.prototype.update=function(row) {
	this.State=row["state"];
	this.ThreefoldClaimable=row["threefold_claimable"];
	this.FiftymoveClaimable=row["fiftymove_claimable"];
	this.DrawOffered=row["draw_offered"];

	/*
	the order is important - the client requesting the undo has to only
	do the undo if it is granted AND the undo is still outstanding on the client
	(on the server it will already have been set back to false)
	*/

	this.UndoGranted=row["undo_granted"];

	if(this.UndoRequested && this.UndoGranted) {
		this.History.Undo();
	}

	this.UndoRequested=row["undo_requested"];

	this.Result=row["result"];
	this.ResultDetails=row["result_details"];
	this.MtimeFinish=row["mtime_finish"];
	this.MtimeLastUpdate=row["mtime_last_update"];

	if(this.State===GAME_STATE_FINISHED) {
		this.game_over(this.Result, this.ResultDetails);

		if(this.ResultDetails!==RESULT_DETAILS_TIMEOUT) { //if it's timeout, let the clock go down to 0 and pause itself
			this.clock_pause();
		}
	}

	this.Update.Fire();
}

/*
request/grant undo

NOTE

undo_requested has been changed in the db to be the same as draw_offered -
the colour that requested it, or null.  (to avoid an obvious exploit whereby
the draw button is clicked, and then clicked again, and a draw "by agreement"
is achieved without any input from the other player.

these functions and other code that deals with UndoRequested will need
updating, as will the server code.
*/

LiveGame.prototype.RequestUndo=function() {
	Xhr.QueryAsync(ap("/xhr/request_undo.php"), function(response) {
		if(response===true) {
			this.UndoRequested=true;
			this.UndoGranted=false;
		}
	}, {
		"gid": this.Gid
	}, this);
}

LiveGame.prototype.GrantUndo=function() {
	Xhr.QueryAsync(ap("/xhr/grant_undo.php"), function(response) {
		if(response===true) {
			this.UndoRequested=false;
			this.UndoGranted=true;
			this.History.Undo();
		}
	}, {
		"gid": this.Gid
	}, this);
}

LiveGame.prototype.start_updates=function() {
	Base.LongPoll.GatheringClientState.AddHandler(this, function(update) {
		update.AddClientData(this, UPDATE_TYPE_GAME, {
			"gid": this.Gid,
			"mtime_last_update": this.MtimeLastUpdate
		});
	});

	Base.LongPoll.HaveUpdates.AddHandler(this, function(update) {
		var data=update.GetUpdates(this);

		if(data!==null) {
			this.update(data);
		}
	});
}

LiveGame.prototype.UserMove=function(fs, ts, promote_to) {
	/*
	tournament games - white can premove before the clocks start

	NOTE the clock start delay is supposed to be used only to give white
	a chance to premove at the start of tournament games.  Using a delay
	with clock start indexes other than -1 doesn't make any sense and may
	produce weird results.
	*/

	if(this.get_est_server_mtime()<this.MtimeStart+(this.ClockStartDelay*MSEC_PER_SEC)) {
		this.UserPremove(fs, ts, promote_to);
	}

	else {
		var promotion=false;
		var piece=this.Position.Board[fs];

		//the following looks dodgy because promotion only gets set if promote_to isn't specified, but it doesn't matter

		if(Util.type(piece)===PAWN && (Util.y(ts)===0 || Util.y(ts)===7) && !promote_to) {
			promotion=true;

			if(Base.App.User.Prefs.AutoQueen.Get()) {
				promote_to=QUEEN;
			}

			else {
				this.Board.PromoteDialog.Show();
				this.Board.PromoteDialog.Colour.Set(this.user_colour);

				this.Board.PromoteDialog.PieceSelected.AddHandler(this, function(data) {
					this.UserMove(fs, ts, data.Piece);
					this.Board.PromoteDialog.Hide();

					return true;
				});
			}
		}

		if(promote_to || !promotion) {
			if(this.Move(fs, ts, promote_to).Legal) {
				/*
				NOTE it is important to get a reference to the move
				immediately for use in the callback, as the opponent
				may have moved by the time the request comes back.
				(this is likely if they premoved)
				*/

				var move=this.History.MainLine.LastMove;

				this.time_remaining_at_last_move=this.Clock.Mtime[this.Table.PlayerSeat.Colour];
				this.user_has_moved=true;
				this.clock_pause();

				Xhr.QueryAsync("/xhr/move.php", function(response, round_trip_time) {
					if(response!==false) {
						move.Mtime=response;
						this.last_move_round_trip_time=round_trip_time;
					}

					else {
						this.Undo();
						this.update_lastmove_hilite();
					}

					var self=this;

					setTimeout(function() {
						self.clock_start();
					}, LiveGame.CLOCK_DELAY_AFTER_MOVE);
				}, {
					"gid": this.Gid,
					"fs": fs,
					"ts": ts,
					"promote_to": promote_to,
					"lrtt": this.last_move_round_trip_time
				}, this);
			}
		}
	}
}

LiveGame.prototype.UserBughouseMove=function(piece, ts) {
	if(this.BughouseMove(piece, ts).Legal) {
		var move=this.History.MainLine.LastMove;

		this.time_remaining_at_last_move=this.Clock.Mtime[this.Table.PlayerSeat.Colour];
		this.user_has_moved=true;
		this.clock_pause();

		Xhr.QueryAsync("/xhr/bughouse_move.php", function(response, round_trip_time) {
			if(response!==false) {
				move.Mtime=response;
				this.last_move_round_trip_time=round_trip_time;
			}

			else {
				this.Undo();
				this.update_lastmove_hilite();
			}

			var self=this;

			setTimeout(function() {
				self.clock_start();
			}, LiveGame.CLOCK_DELAY_AFTER_MOVE);
		}, {
			"gid": this.Gid,
			"piece": piece,
			"ts": ts,
			"lrtt": this.last_move_round_trip_time
		}, this);
	}
}

LiveGame.prototype.BughouseMove=function(pc, ts, dryrun) {
	dryrun=dryrun||false;

	var colour=this.Position.Active;
	var piece=new Piece(pc);
	var moveto=new Piece(this.Position.Board[ts]);
	var move=new Move();

	move.Ts=ts;
	move.Piece=pc;

	if(Util.on_board(ts) && piece.Type!==SQ_EMPTY && piece.Colour===colour && moveto.Type===SQ_EMPTY) {
		var pos=new Position(this.Position.GetFen());
		var tc=Util.sq_to_coords(ts);
		var relts=Util.rel_sq_no(ts, colour);
		var opp_colour=Util.opp_colour(colour);

		move.Label.Piece=Fen.piece_char[pc];
		move.Label.Disambiguation=SIGN_BUGHOUSE_DROP;
		move.Label.To=Util.alg_sq(ts);

		if(piece.Type===PAWN) {
			var rank=Util.y(ts);

			if(rank>0 && rank<7) {
				move.Valid=true;
			}
		}

		else if(piece.Type!==KING) {
			move.Valid=true;
		}

		if(move.Valid) {
			move.Action.push({
				Sq: ts,
				Pc: pc
			});

			var action;

			for(var i=0; i<move.Action.length; i++) {
				action=move.Action[i];
				pos.SetSquare(action.Sq, action.Pc);
			}

			var plr_king_attackers=Util.attackers(pos.Board, pos.Kings[colour], opp_colour);

			if(plr_king_attackers.length===0) {
				move.Legal=true;
			}
		}

		if(move.Legal) {
			var old_pos=this.Position;

			this.Position=pos;

			if(colour===BLACK) {
				this.Position.Fullmove++;
			}

			this.Position.Active=opp_colour;

			if(move.Capture!==null || piece.Type===PAWN) {
				this.Position.Clock=0;
			}

			else {
				this.Position.Clock++;
			}

			this.Position.Ep=null;

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
				this.DrawOffered=null;
				this.UndoRequested=false;

				if(this.IsMated(opp_colour)) { //checkmate
					this.game_over(Result.WinResult[colour], RESULT_DETAILS_CHECKMATE);
				}

				else {
					if(this.Position.Clock>49) {
						this.FiftymoveClaimable=true;
					}

					this.CheckThreefold();
				}

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

LiveGame.prototype.can_mate=function(colour) {
	if(this.Type===GAME_TYPE_BUGHOUSE) {
		return true;
	}

	else {
		return IGameCommon.prototype.can_mate.call(this, colour);
	}
}

LiveGame.prototype.IsMated=function(colour) {
	if(this.Type===GAME_TYPE_BUGHOUSE) {
		var opp_colour=Util.opp_colour(colour);
		var king=this.Position.Kings[colour];

		if(IGameCommon.prototype.IsMated.call(this, colour)) {
			var attackers=Util.attackers(this.Position.Board, king, opp_colour);

			if(attackers.length>1) {
				return true;
			}

			else {
				var sq=attackers[0];
				var type=Util.type(this.Position.Board[sq]);

				if(type===KNIGHT || type===PAWN || Util.squares_between(sq, king).length===0) {
					return true;
				}
			}
		}

		return false;
	}

	else {
		return IGameCommon.prototype.IsMated.call(this, colour);
	}
}

LiveGame.prototype.CountLegalMoves=function(colour) {
	var legal_moves=IGameCommon.prototype.CountLegalMoves.call(this, colour);

	if(this.Type===GAME_TYPE_BUGHOUSE) {
		for(var type=PAWN; type<=QUEEN; type++) {
			if(this.BughousePiecesAvailable[colour].PiecesAvailable[type]>0) {
				for(var sq=0; sq<64; sq++) {
					if(this.Position.Board[sq]===SQ_EMPTY) {
						if(this.BughouseMove(Util.piece(type, colour), sq, true).Legal) {
							legal_moves++;
						}
					}
				}
			}
		}
	}

	return legal_moves;
}

LiveGame.prototype.clear_all_hilites=function() {
	for(var i=0; i<64; i++) {
		this.Board.UnhiliteSq(i);
	}
}

LiveGame.prototype.get_est_server_mtime=function() {
	return mtime()+this.estimated_server_time_diff;
}

/*
kill everything
*/

LiveGame.prototype.Die=function() {
	this.deactivate();
	this.History.Die();
	this.ClearEventHandlers();
}

/*
kill everything except the history (for game over, in which case
the history might still need to do one update)
*/

LiveGame.prototype.deactivate=function() {
	this.Board.PromoteDialog.Hide();
	this.clear_all_hilites();
	this.update_lastmove_hilite();
	this.Premoves.Die();
}

LiveGame.prototype.Resign=function() {
	Xhr.RunQueryAsync(ap("/xhr/resign.php"), {
		"gid": this.Gid
	});
}

/*
NOTE this will be fired multiple times (user move, opp move, update, initial
history load can all trigger it)
*/

LiveGame.prototype.game_over=function(result, result_details) {
	IGameCommon.prototype.game_over.call(this, result, result_details);

	if(result_details!==RESULT_DETAILS_TIMEOUT) {
		this.clock_pause();
	}
	
	this.deactivate();
	this.GameOver.Fire();
}
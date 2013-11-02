/*
to be implemented onto existing histories of any kind

NOTE this will be implemented onto the same History multiple times (when
a new game gets created on the same table)
*/

function ILiveHistory(table, game) {
	IEventHandlerLogging.implement(this);

	this.EditMode=IHistoryCommon.EDIT_MODE_APPEND;
	this.Update=new Event(this);
	this.Table=table;
	this.Game=game;
	this.loaded=false;
	this.start_updates();

	this.Updating=false;
}

ILiveHistory.prototype.add_moves=function(table) {
	var row, move;

	for(var i=0; i<table.length; i++) {
		row=table[i];
		move=new Move();

		move.MoveIndex=row["move_index"];
		move.Label.Piece=row["label_piece"];
		move.Label.Disambiguation=row["label_disambiguation"];
		move.Label.Sign=row["label_sign"];
		move.Label.To=row["label_to"];
		move.Label.Special=row["label_special"];
		move.Label.Check=row["label_check"];
		move.Label.Notes=row["label_notes"];
		move.Colour=row["colour"];
		move.Fs=row["fs"];
		move.Ts=row["ts"];
		move.Piece=row["piece"];
		move.Mtime=row["mtime"];
		move.Fen=row["fen"];
		move.Capture=row["capture"];
		move.PromoteTo=row["promote_to"];
		move.Gid=row["gid"];

		this.MainLine.Line.Each(function(item) {
			if(item.MoveIndex===move.MoveIndex) {
				this.MainLine.DeleteMove(item);

				return true;
			}
		}, this);

		this.Move(move);
	}
}

ILiveHistory.prototype.start_updates=function() {
	Base.LongPoll.GatheringClientState.AddHandler(this, function(update) {
		var move_index=-1;

		if(this.MainLine.Line.Length>0) {
			move_index=this.MainLine.LastMove.MoveIndex;
		}

		var data={
			"gid": this.Game.Gid,
			"move_index": move_index
		};

		var seat=this.Table.PlayerSeat;

		/*
		check whether we can safely request the opponent's moves only from now on
		(we have to have received an update for this, so white will receive his first move
		in his first update.  the move added by the Game will be deleted.)
`		*/

		if(seat!==null && this.Game.GameId===seat.GameId && this.loaded) { //only interested in opp's moves
			data["colour"]=Util.opp_colour(seat.Colour);
		}

		update.AddClientData(this, UPDATE_TYPE_HISTORY, data);
	});

	Base.LongPoll.HaveUpdates.AddHandler(this, function(update) {
		var data=update.GetUpdates(this);

		if(data!==null) {
			var selected_move=null;

			if(this.SelectedMove!==null && this.SelectedMove!==this.MainLine.LastMove) {
				selected_move=this.SelectedMove;
			}

			this.BulkUpdate=true;

			this.add_moves(data);

			this.BulkUpdate=false;

			if(selected_move!==null) {
				//this.Select(selected_move);

				/*
				NOTE above line commented so that opponent's moves are
				seen if the user is looking through the history.  was gonna
				do a pref for this but encountered the problem of not having
				anywhere to add a long description of the field.

				live_history_auto_select_on_opponents_moves is just too long
				so either the prefs system should be changed to allow for
				descriptions to be added somewhere or only obvious, simple things
				should have prefs.
				*/
			}

			this.loaded=true;
			this.Update.Fire();

			if(this.SelectedMove!==null) {
				this.Moved.Fire({
					Move: this.SelectedMove
				});

				this.SelectedMoveChanged.Fire({
					Move: this.SelectedMove
				});
			}
		}
	});
}

ILiveHistory.prototype.Die=function() {
	this.ClearEventHandlers();
}
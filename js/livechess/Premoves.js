/*
class for sending premoves to the server, cancelling them, and receiving
updates when the serverside list changes.

to see whether updates are needed, the last move index is used - the user's
premove situation only changes when the opponent moves.
*/

function Premoves(game) {
	IEventHandlerLogging.implement(this);

	this.List=[];
	this.Game=game;
	this.BeforeUpdate=new Event(this);
	this.Update=new Event(this);
	this.init_load();
	this.start_updates();
}

Premoves.prototype.init_load=function() {
	Xhr.QueryAsync(ap("/xhr/premove_list.php"), function(data) {
		this.BeforeUpdate.Fire();
		this.update_list(data);
		this.Update.Fire();
	}, {
		"gid": this.Game.Gid
	}, this);
}

Premoves.prototype.start_updates=function() {
	Base.LongPoll.GatheringClientState.AddHandler(this, function(update) {
		var colour, seated;
		var move_index=-1;

		seated=(this.Game.Table.PlayerSeat!==null);

		if(seated) {
			colour=this.Game.Table.PlayerSeat.Colour;

			if(this.Game.History.MainLine.Line.Length>0) {
				move_index=this.Game.History.MainLine.LastMove.MoveIndex;
			}

			update.AddClientData(this, UPDATE_TYPE_PREMOVES, {
				"gid": this.Game.Gid,
				"move_index": move_index,
				"colour": colour
			});
		}
	});

	Base.LongPoll.HaveUpdates.AddHandler(this, function(update) {
		var data=update.GetUpdates(this);

		if(data!==null) {
			this.BeforeUpdate.Fire();
			this.update_list(data);
			this.Update.Fire();
		}
	});
}

Premoves.prototype.Add=function(move) {
	this.BeforeUpdate.Fire();
	this.List.push(move);

	Xhr.QueryAsync("/xhr/premove_push.php", function(response) {
		/*
		if failed, delete failed premove and any subsequent ones
		*/

		if(!response["success"]) {
			this.BeforeUpdate.Fire();

			while(this.List.length>0 && end(this.List).MoveIndex>=response["move_index"]) {
				this.List.pop();
			}

			this.Update.Fire();
		}
	}, {
		"gid": this.Game.Gid,
		"fs": move.Fs,
		"ts": move.Ts,
		"move_index": move.MoveIndex,
		"promote_to": move.PromoteTo
	}, this);

	this.Update.Fire();
}

Premoves.prototype.Undo=function() {
	if(this.List.length>0) {
		this.BeforeUpdate.Fire();

		var move=this.List.pop();

		Xhr.QueryAsync(ap("/xhr/premove_clear.php"), function(response) {
			if(response===false) {
				this.BeforeUpdate.Fire();
				this.List.push(move);
				this.Update.Fire();
			}
		}, {
			"gid": this.Game.Gid,
			"move_index": move.MoveIndex
		}, this);

		this.Update.Fire();
	}
}

Premoves.prototype.Clear=function() {
	var old_list=Data.Serialise(this.List);

	this.BeforeUpdate.Fire();

	this.List=[];

	if(this.List.length>0) {
		Xhr.QueryAsync(ap("/xhr/premove_clear.php"), function(response) {
			if(response===false) {
				this.BeforeUpdate.Fire();

				this.List=Data.Unserialise(old_list);

				this.Update.Fire();
			}
		}, {
			"gid": this.Game.Gid
		}, this);
	}

	this.Update.Fire();
}

Premoves.prototype.update_list=function(table) {
	var row, move;

	if(is_array(table)) {
		this.List=[];

		for(var i=0; i<table.length; i++) {
			row=table[i];

			move={
				Fs: row["fs"],
				Ts: row["ts"],
				PromoteTo: row["promote_to"],
				MoveIndex: row["move_index"]
			};

			this.List.push(move);
		}
	}
}

Premoves.prototype.Die=function() {
	this.ClearEventHandlers();
}
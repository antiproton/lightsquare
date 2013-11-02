/*
the seat has an update that checks whether the username has changed.

checking whether people are ready is done separately.
*/

function Seat(table, game_id, colour) {
	IEventHandlerLogging.implement(this);

	this.Table=table;
	this.GameId=game_id;
	this.Colour=colour;
	this.ready=false;
	this.username=null;

	this.init_events();
	this.init_props();
	this.start_updates();
}

Seat.prototype.init_events=function() {
	this.Update=new Event(this);
}

Seat.prototype.init_props=function() {
	this.Username=new Property(this, function() {
		return this.username;
	}, function(value) {
		this.username=value;
	});

	this.Ready=new Property(this, function() {
		return this.ready;
	}, function(value) {
		this.ready=value;
	});
}

Seat.prototype.start_updates=function() {
	Base.LongPoll.GatheringClientState.AddHandler(this, function(update) {
		update.AddClientData(this, UPDATE_TYPE_SEAT, {
			"table": this.Table.Id,
			"game_id": this.GameId,
			"colour": this.Colour,
			"ready": this.ready,
			"username": this.Username.Get()
		});
	});

	Base.LongPoll.HaveUpdates.AddHandler(this, function(update) {
		var data=update.GetUpdates(this);

		if(data!==null) {
			var event_data={
				OldUsername: this.username
			};

			this.Username.Set(data["username"]);
			this.Ready.Set(data["ready"]);

			this.Update.Fire(event_data);
		}
	});
}

Seat.prototype.Stand=function() {
	var self=this;
	var old_username=this.username;

	Xhr.QueryAsync(ap("/xhr/stand.php"), function(response) {
		if(response!==false) {
			self.Username.Set(null);

			self.Update.Fire({
				OldUsername: old_username
			});
		}
	}, {
		"table": this.Table.Id,
		"game_id": this.GameId,
		"colour": this.Colour
	});
}

Seat.prototype.Sit=function(username) {
	var self=this;
	var old_username=this.username;

	Xhr.QueryAsync(ap("/xhr/sit.php"), function(response) {
		if(response!==false) {
			self.Username.Set(username);

			self.Update.Fire({
				OldUsername: old_username
			});
		}
	}, {
		"table": this.Table.Id,
		"game_id": this.GameId,
		"colour": this.Colour
	});
}

Seat.prototype.SetReady=function(ready) {
	var old_ready=this.ready;

	this.Ready.Set(ready);

	this.Update.Fire({
		OldUsername: this.username
	});

	Xhr.QueryAsync(ap("/xhr/ready.php"), function(response) {
		if(response===false) {
			this.ready=old_ready;

			this.Update.Fire({
				OldUsername: this.username
			});
		}
	}, {
		"table": this.Table.Id,
		"ready": ready
	});
}

Seat.prototype.Die=function() {
	this.ClearEventHandlers();
}
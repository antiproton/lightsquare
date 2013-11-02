/*
listen for direct challenges to the user (challenges where the "at" field is
set to their username) and fire an event when they come in
*/

function DirectChallengeListener() {
	this.ChallengeReceived=new Event(this);

	this.last_challenge_mtime=0;
	this.init_updates();
}

DirectChallengeListener.prototype.init_updates=function() {
	Base.LongPoll.GatheringClientState.AddHandler(this, function(update) {
		update.AddClientData(this, UPDATE_TYPE_DIRECT_CHALLENGE, {
			"last_challenge_mtime": this.last_challenge_mtime
		});
	});

	Base.LongPoll.HaveUpdates.AddHandler(this, function(update) {
		var data=update.GetUpdates(this);
		var row;

		if(is_array(data)) {
			for(var i=0; i<data.length; i++) {
				row=data[i];

				this.ChallengeReceived.Fire(row);

				if(row["mtime_created"]>this.last_challenge_mtime) {
					this.last_challenge_mtime=row["mtime_created"];
				}
			}
		}
	});
}
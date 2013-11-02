/*
quick challenge

this will fire Done with either success (and a table id) or failure
after submitting
*/

function QuickChallenge(variant, timing_initial, timing_increment, rating_min, rating_max, rated, choose_colour, challenge_colour, challenge_to) {
	IEventHandlerLogging.implement(this);

	this.Variant=variant;
	this.TimingInitial=timing_initial;
	this.TimingIncrement=timing_increment;
	this.RatingMin=rating_min;
	this.RatingMax=rating_max;
	this.Rated=rated;
	this.ChooseColour=choose_colour||false;
	this.ChallengeColour=challenge_colour||WHITE;
	this.ChallengeTo=challenge_to||null;

	this.waiting=false;

	this.Waiting=new Property(this, function() {
		return this.waiting;
	});

	this.Done=new Event(this);
}

QuickChallenge.SUCCESS=0;
QuickChallenge.FAIL=1;
QuickChallenge.CANCELLED=2;

QuickChallenge.prototype.Submit=function() {
	var self=this;
	this.waiting=true;
	Base.App.UpdateQuickChallenge();

	Xhr.QueryAsync(ap("/xhr/challenge_open.php"), function(response) {
		if(self.waiting) {
			self.waiting=false;

			if(response===false) {
				self.Done.Fire({
					Info: QuickChallenge.FAIL
				});
			}

			else if(is_number(response)) {
				self.Done.Fire({
					Info: QuickChallenge.SUCCESS,
					Table: response
				});
			}
		}

		self.ClearEventHandlers();
	}, {
		"variant": this.Variant,
		"timing_initial": this.TimingInitial,
		"timing_increment": this.TimingIncrement,
		"rating_min": this.RatingMin,
		"rating_max": this.RatingMax,
		"rated": this.Rated,
		"choose_colour": this.ChooseColour,
		"challenge_colour": this.ChallengeColour,
		"challenge_to": this.ChallengeTo,
		"ts": mtime()
	});
}

QuickChallenge.prototype.Cancel=function() {
	this.waiting=false;
	this.ClearEventHandlers();
	Base.App.UpdateQuickChallenge();
	Xhr.RunAsync(ap("/xhr/challenge_cancel.php"));

	this.Done.Fire({
		Info: QuickChallenge.CANCELLED
	});
}

/*
static - accept a quick challenge
*/

QuickChallenge.Accept=function(id, callback, obj) {
	obj=obj||window;

	Xhr.QueryAsync(ap("/xhr/challenge_accept.php"), function(response) {
		if(is_function(callback)) {
			callback.call(obj, response);
		}
	}, {
		"table": id
	});
}

/*
static - decline a quick challenge
*/

QuickChallenge.Decline=function(id) {
	Xhr.RunQueryAsync(ap("/xhr/challenge_decline.php"), {
		"table": id
	});
}
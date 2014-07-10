define(function(require) {
	var html = require("file!./create_challenge_form.html");
	var Ractive = require("lib/dom/Ractive");
	var jsonChessConstants = require("jsonchess/constants");
	
	function CreateChallengeForm(user, parent) {
		this._user = user;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				waiting: (this._user.getCurrentChallenge() !== null),
				initialTime: "10m",
				timeIncrement: "5",
				ratingMin: "-100",
				ratingMax: "+100"
			}
		});
		
		this._template.on("create_or_cancel", (function(event) {
			event.original.preventDefault();
			
			if(this._template.get("waiting")) {
				this._user.cancelChallenge();
			}
			
			else {
				this._user.createChallenge({
					initialTime: this._template.get("initialTime").toString(),
					timeIncrement: this._template.get("timeIncrement").toString(),
					acceptRatingMin: this._template.get("ratingMin").toString(),
					acceptRatingMax: this._template.get("ratingMax").toString()
				});
			}
		}).bind(this));
		
		this._fillInLastChallengeOptions();
		
		this._user.LoggedIn.addHandler(this, function() {
			this._fillInLastChallengeOptions();
		});
		
		this._user.ChallengeCreated.addHandler(this, function() {
			this._template.set("waiting", true);
		});
		
		this._user.ChallengeExpired.addHandler(this, function() {
			this._template.set("waiting", false);
		});
	}
	
	CreateChallengeForm.prototype._fillInLastChallengeOptions = function() {
		var options = this._user.getLastChallengeOptions();
		
		if(options !== null) {
			this._template.set("initialTime", options.initialTime);
			this._template.set("timeIncrement", options.timeIncrement);
			this._template.set("ratingMin", options.acceptRatingMin);
			this._template.set("ratingMax", options.acceptRatingMax);
		}
	}
	
	return CreateChallengeForm;
});
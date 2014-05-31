define(function(require) {
	require("css!./create_challenge_form.css");
	var html = require("file!./create_challenge_form.html");
	var Ractive = require("lib/dom/Ractive");
	var jsonChessConstants = require("jsonchess/constants");
	
	function CreateChallengeForm(user, parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				waiting: false,
				initialTime: "10m",
				timeIncrement: "5",
				ratingMin: "-100",
				ratingMax: "+100"
			}
		});
		
		this._user = user;
		this._waiting = false;
		
		this._template.on("create_or_cancel", (function(event) {
			event.original.preventDefault();
			
			if(this._waiting) {
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
		
		user.ChallengeCreated.addHandler(this, function() {
			this._setWaiting(true);
		});
		
		user.ChallengeExpired.addHandler(this, function() {
			this._setWaiting(false);
		});
	}
	
	CreateChallengeForm.prototype._setWaiting = function(waiting) {
		this._waiting = waiting;
		this._template.set("waiting", waiting);
	}
	
	return CreateChallengeForm;
});
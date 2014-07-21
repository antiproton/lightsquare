define(function(require) {
	require("css!./create_challenge_form.css");
	var html = require("file!./create_challenge_form.html");
	var Ractive = require("lib/dom/Ractive");
	var jsonChessConstants = require("jsonchess/constants");
	
	function CreateChallengeForm(user, server, parent) {
		this._user = user;
		this._server = server;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				waiting: false,
				percentExpired: null,
				initialTime: "10m",
				timeIncrement: "5",
				ratingMin: "-100",
				ratingMax: "+100"
			}
		});
		
		this._timeoutAnimation = null;
		this._updateCurrentChallenge();
		
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
		
		this._user.LoggedIn.addHandler(function() {
			this._fillInLastChallengeOptions();
		}, this);
		
		this._user.ChallengeCreated.addHandler(function() {
			this._updateCurrentChallenge();
		}, this);
		
		this._user.ChallengeExpired.addHandler(function() {
			this._updateCurrentChallenge();
			
			if(this._timeoutAnimation) {
				this._timeoutAnimation.stop();
				this._timeoutAnimation = null;
			}
		}, this);
	}
	
	CreateChallengeForm.prototype._updateCurrentChallenge = function() {
		var challenge = this._user.getCurrentChallenge();
		
		this._template.set("waiting", challenge !== null);
		
		if(challenge) {
			var expiryTime = (challenge ? challenge.expiryTime : null);
			var timeLeft = expiryTime - this._server.getServerTime();
			var timeElapsed = jsonChessConstants.CHALLENGE_TIMEOUT - timeLeft;
			var percentExpired = timeElapsed / (jsonChessConstants.CHALLENGE_TIMEOUT / 100);
			
			this._template.set("percentExpired", percentExpired);
			
			this._timeoutAnimation = this._template.animate("percentExpired", 100, {
				duration: timeLeft
			});
		}
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
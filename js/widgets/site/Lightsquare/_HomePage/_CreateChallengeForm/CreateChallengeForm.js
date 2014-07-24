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
		
		this._clearErrorTimer = null;
		this._timeoutAnimation = null;
		this._updateCurrentChallenge();
		
		this._template.on("create_or_cancel", (function(event) {
			event.original.preventDefault();
			
			if(this._template.get("waiting")) {
				this._user.cancelChallenge();
			}
			
			else {
				this._clearError();
				this._clearClearErrorTimer();
				
				this._user.createChallenge({
					initialTime: this._template.get("initialTime").toString(),
					timeIncrement: this._template.get("timeIncrement").toString(),
					acceptRatingMin: this._template.get("ratingMin").toString(),
					acceptRatingMax: this._template.get("ratingMax").toString()
				}).then((function() {
					this._updateCurrentChallenge();
				}).bind(this), (function(error) {
					this._setError(error);
				}).bind(this));
			}
		}).bind(this));
		
		this._fillInLastChallengeOptions();
		
		this._user.LoggedIn.addHandler(function() {
			this._fillInLastChallengeOptions();
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
	
	CreateChallengeForm.prototype._clearError = function() {
		this._template.set("error", "");
	}
	
	CreateChallengeForm.prototype._setError = function(message) {
		this._template.set("error", message);
		this._setClearErrorTimer();
	}
	
	CreateChallengeForm.prototype._setClearErrorTimer = function() {
		this._clearErrorTimer = setTimeout((function() {
			this._clearError();
			this._clearErrorTimer = null;
		}).bind(this), 10 * 1000);
	}
	
	CreateChallengeForm.prototype._clearClearErrorTimer = function() {
		if(this._clearErrorTimer !== null) {
			clearTimeout(this._clearErrorTimer);
			
			this._clearErrorTimer = null;
		}
	}
	
	return CreateChallengeForm;
});
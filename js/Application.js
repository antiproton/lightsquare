define(function(require) {
	var Event = require("lib/Event");
	require("lib/Array.getShallowCopy");
	
	function Application(server) {
		this._server = server;
		this._challenges = [];
		this._isUpdatingChallengeList = true;
		
		this.NewChallenge = new Event(this);
		this.ChallengeExpired = new Event(this);
		
		this._server.subscribe("/challenges", (function(challenges) {
			challenges.forEach((function(challenge) {
				this._challenges.push(challenge);
				
				this.NewChallenge.fire({
					challenge: challenge
				});
			}).bind(this));
		}).bind(this));
		
		this._server.subscribe("/challenge/expired", (function(id) {
			this._challenges = this._challenges.filter(function(challenge) {
				return (challenge.id !== id);
			});
			
			this.ChallengeExpired.fire({
				id: id
			});
		}).bind(this));
		
		this._server.send("/request/challenges");
	}
	
	Application.prototype.getChallenges = function() {
		return this._challenges.getShallowCopy();
	}
	
	Application.prototype.startUpdatingChallengeList = function() {
		if(!this._isUpdatingChallengeList) {
			this._challenges.forEach((function(challenge) {
				this.ChallengeExpired.fire({
					id: challenge.id
				});
			}).bind(this));
			
			this._challenges = [];
			
			this._server.send("/unignore", "/challenges");
			this._server.send("/unignore", "/challenge/expired");
			this._server.send("/request/challenges");
			
			this._isUpdatingChallengeList = true;
		}
	}
	
	Application.prototype.stopUpdatingChallengeList = function() {
		if(this._isUpdatingChallengeList) {
			this._server.send("/ignore", "/challenges");
			this._server.send("/ignore", "/challenge/expired");
			
			this._isUpdatingChallengeList = false;
		}
	}
	
	return Application;
});
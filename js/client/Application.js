define(function(require) {
	var Event = require("lib/Event");
	require("lib/Array.getShallowCopy");
	
	function Application(server) {
		this._server = server;
		this._challenges = [];
		
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
		this._server.send("/interested", "/challenges");
	}
	
	Application.prototype.stopUpdatingChallengeList = function() {
		this._server.send("/not_interested", "/challenges");
	}
	
	return Application;
});
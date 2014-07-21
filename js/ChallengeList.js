define(function(require) {
	var Event = require("lib/Event");
	require("lib/Array.getShallowCopy");
	
	function ChallengeList(server) {
		this._server = server;
		this._challenges = [];
		this._isUpdating = false;
		
		this.Updated = new Event();
		
		this._server.subscribe("/challenges", (function(challenges) {
			this._challenges = this._challenges.concat(challenges);
			this.Updated.fire();
		}).bind(this));
		
		this._server.subscribe("/challenge/expired", (function(id) {
			this._challenges = this._challenges.filter(function(challenge) {
				return (challenge.id !== id);
			});
			
			this.Updated.fire();
		}).bind(this));
		
		this._server.ConnectionOpened.addHandler(this, function() {
			this._server.send("/request/challenges");
		});
		
		this._server.ConnectionLost.addHandler(this, function() {
			this._challenges = [];
			this.Updated.fire();
		});
	}
	
	ChallengeList.prototype.getChallenges = function() {
		return this._challenges.getShallowCopy();
	}
	
	ChallengeList.prototype.startUpdating = function() {
		if(!this._isUpdating) {
			this._server.send("/unignore", "/challenges");
			this._server.send("/unignore", "/challenge/expired");
			this._server.send("/request/challenges");
			
			this._isUpdating = true;
		}
	}
	
	ChallengeList.prototype.stopUpdating = function() {
		if(this._isUpdating) {
			this._challenges = [];
			
			this.Updated.fire();
			
			this._server.send("/ignore", "/challenges");
			this._server.send("/ignore", "/challenge/expired");
			
			this._isUpdating = false;
		}
	}
	
	return ChallengeList;
});
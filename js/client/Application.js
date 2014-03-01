define(function(require) {
	var Challenge = require("./Challenge");
	
	function Application(server) {
		this._server = server;
		
		this.NewChallenge = new Event(this);
		
		this._server.subscribe("/challenge/new", (function(challenges) {
			challenges.forEach((function(challenge) {
				this.NewChallenge.fire({
					challenge: new Challenge(this._server, challenge)
				});
			}).bind(this));
		}).bind(this));
	}
	
	Application.prototype.createChallenge = function(options) {
		this._server.send("/challenge/create", options);
	}
	
	return Application;
});
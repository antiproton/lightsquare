define(function(require) {
	require("css!./challenge_graph.css");
	var html = require("file!./challenge_graph.html");
	var Event = require("lib/Event");
	
	function ChallengeGraph(app, user, parent) {
		this._graphHeightEms = 20;
		this._challengeHeightEms = 1.4;
		this._app = app;
		this._user = user;
		this._setupTemplate(parent);
		this._updateTemplate();
	}
	
	ChallengeGraph.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				graphHeight: this._graphHeightEms + "em",
				challengeHeight: this._challengeHeightEms + "em",
				challenges: this._app.getChallenges(),
				getLeftOffset: function(challenge) {
					var initialTime = Time.fromUnitString(challenge.options.initialTime);
				},
				getTopOffset: function(challenge, index) {
					var ratingAbove1000 = Math.max(0, challenge.owner.rating - 1000);
					var ratingScale = 1 / (1500 / ratingAbove1000);
					console.log(ratingScale);
					var emOffset = 20 - (ratingScale * 20);
					
					return emOffset + "em";
				}
			}
		});
		
		this._template.on("accept", (function(event, id) {
			this._user.acceptChallenge(id);
		}).bind(this));
		
		var lastZIndex = 1;
		
		this._template.on("focus", function(event) {
			event.original.target.style.zIndex = ++lastZIndex;
		});
		
		this._app.NewChallenge.addHandler(this, function() {
			this._updateTemplate();
		});
		
		this._app.ChallengeExpired.addHandler(this, function() {
			this._updateTemplate();
		});
	}
	
	ChallengeGraph.prototype._updateTemplate = function() {
		this._template.set("challenges", this._app.getChallenges());
	}
	
	return ChallengeGraph;
});
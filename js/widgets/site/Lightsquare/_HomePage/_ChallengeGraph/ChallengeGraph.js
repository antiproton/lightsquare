define(function(require) {
	require("css!./challenge_graph.css");
	var html = require("file!./challenge_graph.html");
	var Event = require("lib/Event");
	
	function ChallengeGraph(app, user, parent) {
		this._app = app;
		this._user = user;
		this._setupTemplate(parent);
	}
	
	ChallengeGraph.prototype._setupTemplate = function(parent) {
		var graphHeightInEm = 20;
		var graphRangeInEm = graphHeightInEm - 1;
		var challengeHeightInEm = 1.4;
		var minRating = 1000;
		var maxRating = 2200;
		var ratingRange = maxRating - minRating;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				graphHeightInEm: graphHeightInEm,
				challengeHeightInEm: challengeHeightInEm,
				challenges: this._app.getChallenges(),
				getLeftOffsetInEm: function(challenge) {
					var initialTime = Time.fromUnitString(challenge.options.initialTime);
				},
				getTopOffsetInEm: (function(challenge, index) {
					var ratingAboveMinimum = Math.max(0, challenge.owner.rating - minRating);
					var asd = ratingRange / graphRangeInEm;
					var offsetInEm = graphRangeInEm - ratingAboveMinimum / asd;
					
					offsetInEm -= challengeHeightInEm * index;
					
					return offsetInEm;
				}).bind(this)
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
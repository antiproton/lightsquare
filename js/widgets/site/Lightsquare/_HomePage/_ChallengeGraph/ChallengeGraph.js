define(function(require) {
	require("css!./challenge_graph.css");
	var html = require("file!./challenge_graph.html");
	var Event = require("lib/Event");
	
	function ChallengeGraph(app, user, parent) {
		this._app = app;
		this._user = user;
		
		this._minRating = 1000;
		this._maxRating = 2200;
		this._challengesByRatingAndTime = {};
		
		var timeBrackets = ["0", "1m", "3m", "5m", "10m", "20m", "1h"];
		var ratingBrackets = [];
		
		for(var ratingBracket = this._minRating; ratingBracket <= this._maxRating; ratingBracket += 100) {
			ratingBrackets.push(ratingBracket);
		}
		
		var challengesByRatingAndTime = {};
		
		ratingBrackets.forEach(function(ratingBracket) {
			this._challengesByRatingAndTime[ratingBracket] = {};
			
			timeBrackets.forEach(function(timeBracket) {
				this._challengesByRatingAndTime[ratingBracket][timeBracket] = 0;
			});
		});
		
		this._setupTemplate(parent);
	}
	
	ChallengeGraph.prototype._setupTemplate = function(parent) {
		var graphHeightInEm = 20;
		var graphRangeInEm = graphHeightInEm - 1;
		var challengeHeightInEm = 2;
		var ratingRange = this._maxRating - this._minRating;
		
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
					var offsetInEm = graphRangeInEm - ratingAboveMinimum / (ratingRange / graphRangeInEm);
					
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
		
		this._app.ChallengeListUpdated.addHandler(this, function() {
			this._updateTemplate();
		});
	}
	
	ChallengeGraph.prototype._updateTemplate = function() {
		this._template.set("challenges", this._app.getChallenges());
	}
	
	ChallengeGraph.prototype._update = function() {
		for(var ratingBracket in this._challengesByRatingAndTime) {
			for(var timeBracket in this._challengesByRatingAndTime[ratingBracket]) {
				this._challengesByRatingAndTime[ratingBracket][timeBracket] = 0;
			}
		}
	}
	
	ChallengeGraph.prototype._countChallengesInBracket = function(challenge) {
		var ratingBracket = challenge.owner.rating - challenge.owner.rating % 100;
		var timeBracket;
	}
	
	return ChallengeGraph;
});
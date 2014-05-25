define(function(require) {
	require("css!./challenge_graph.css");
	var html = require("file!./challenge_graph.html");
	var Event = require("lib/Event");
	var Time = require("chess/Time");
	require("lib/Array.getShallowCopy");
	
	var AVERAGE_MOVES_PER_GAME = 30;
	
	function ChallengeGraph(app, user, parent) {
		this._app = app;
		this._user = user;
		
		this._timeBrackets = ["0", "1m", "3m", "5m", "10m", "20m", "1h"].map(function(lowerBound, index, lowerBounds) {
			var upperBound = null;
			
			if(index < lowerBounds.length - 1) {
				upperBound = Time.fromUnitString(lowerBounds[index + 1]);
			}
			
			return {
				index: index,
				lowerBound: Time.fromUnitString(lowerBound),
				upperBound: upperBound
			};
		});
		
		this._timeBracketWidthInPercent = 100 / this._timeBrackets.length;
		
		this._minRating = 1000;
		this._maxRating = 2200;
		
		this._ratingBrackets = [];
		
		for(var rating = this._minRating; rating <= this._maxRating; rating += 100) {
			this._ratingBrackets.push(rating);
		}
		
		this._setupTemplate(parent);
	}
	
	ChallengeGraph.prototype._setupTemplate = function(parent) {
		var graphHeightInEm = 20;
		var challengeHeightInEm = 2;
		var graphRangeInEm = graphHeightInEm - challengeHeightInEm;
		var ratingRange = this._maxRating - this._minRating;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				graphHeightInEm: graphHeightInEm,
				challengeHeightInEm: challengeHeightInEm,
				challenges: [],
				getLeftOffsetInPercent: (function(graphChallenge) {
					return graphChallenge.timeBracket.index * this._timeBracketWidthInPercent;
				}).bind(this),
				getTopOffsetInEm: (function(graphChallenge, index) {
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
		var challenges = this._app.getChallenges();
		var graphChallenges = [];
		
		challenges.forEach((function(challenge) {
			var rating = challenge.owner.rating;
			var ratingBracket = Math.max(this._minRating, rating - rating % 100);
			var initialTime = Time.fromUnitString(challenge.options.initialTime);
			var timeIncrement = Time.fromUnitString(challenge.options.timeIncrement, Time.seconds) * AVERAGE_MOVES_PER_GAME;
			var estimatedTotalTime = initialTime + timeIncrement;
			var timeBracket;
			
			this._timeBrackets.getShallowCopy().reverse().some(function(bracket) {
				if(estimatedTotalTime > bracket.lowerBound) {
					timeBracket = bracket;
					
					return true;
				}
			});
			
			graphChallenges.push({
				timeBracket: timeBracket,
				ratingBracket: ratingBracket,
				estimatedTotalTime: estimatedTotalTime,
				challenge: challenge
			});
		}).bind(this));
		
		this._template.set("challenges", graphChallenges);
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
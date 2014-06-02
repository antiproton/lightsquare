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
		
		this._graphHeightInEm = 30;
		this._challengeHeightInEm = 2;
		
		this._gridResolution = {
			x: 1.2,
			y: 0.5
		};
		
		this._timeBrackets = ["0", "3m", "10m", "20m", "1h"].map(function(lowerBound, index, lowerBounds) {
			var upperBound = null;
			var previous = lowerBounds[index - 1];
			var next = lowerBounds[index + 1];
			var label = lowerBound + " - " + next;
			
			if(next) {
				upperBound = Time.fromUnitString(next);
			}
			
			if(!previous) {
				label = "< " + next;
			}
			
			else if(!next) {
				label = "> " + previous;
			}
			
			return {
				index: index,
				lowerBound: Time.fromUnitString(lowerBound),
				upperBound: upperBound,
				label: label
			};
		});
		
		this._timeBracketWidthInPercent = 100 / this._timeBrackets.length;
		
		this._minRating = 1000;
		this._maxRating = 2200;
		
		this._ratingBracketSize = 100;
		
		this._ratingBrackets = [];
		
		for(var rating = this._minRating; rating <= this._maxRating; rating += this._ratingBracketSize) {
			this._ratingBrackets.push(rating);
		}
		
		this._setupTemplate(parent);
	}
	
	ChallengeGraph.prototype._setupTemplate = function(parent) {
		var graphRangeInEm = this._graphHeightInEm - this._challengeHeightInEm;
		var ratingRange = this._maxRating - this._minRating;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				graphHeightInEm: this._graphHeightInEm,
				challengeHeightInEm: this._challengeHeightInEm,
				timeBracketWidthInPercent: 100 / this._timeBrackets.length,
				timeBrackets: this._timeBrackets,
				challenges: [],
				isCurrentChallenge: (function(challenge) {
					var currentChallenge = this._user.getCurrentChallenge();
					
					return (currentChallenge !== null && challenge.id === currentChallenge.getId());
				}).bind(this)
			}
		});
		
		this._template.on("accept", (function(event, id) {
			this._user.acceptChallenge(id);
		}).bind(this));
		
		this._app.ChallengeListUpdated.addHandler(this, function() {
			this._updateTemplate();
		});
	}
	
	ChallengeGraph.prototype._updateTemplate = function() {
		var occupiedGridSquares = {};
		var challenges = this._app.getChallenges();
		var graphRangeInEm = this._graphHeightInEm - this._challengeHeightInEm;
		var ratingRange = this._maxRating - this._minRating;
		var graphChallenges = [];
		
		challenges.forEach((function(challenge, index) {
			var rating = challenge.owner.rating;
			var ratingBracket = Math.max(this._minRating, rating - rating % this._ratingBracketSize);
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
			
			var leftOffset = timeBracket.index * this._timeBracketWidthInPercent;
			
			if(timeBracket.upperBound !== null) {
				var bracketRange = timeBracket.upperBound - timeBracket.lowerBound;
				var timeWithinRange = estimatedTotalTime - timeBracket.lowerBound;
				var offsetWithinBracket = (timeWithinRange / bracketRange) * this._timeBracketWidthInPercent;
				
				leftOffset += offsetWithinBracket;
			}
			
			var ratingAboveMinimum = Math.max(0, challenge.owner.rating - this._minRating);
			var topOffset = Math.max(0, graphRangeInEm - ratingAboveMinimum / (ratingRange / graphRangeInEm));
			
			
			var gridX = leftOffset - leftOffset % this._gridResolution.x;
			var gridY = topOffset - topOffset % this._gridResolution.y;
			var gridSquare = gridX + "," + gridY;
			var gridSquaresMoved = 0;
			var maxGridSquaresToMove = 3;
			
			while(gridSquare in occupiedGridSquares && gridSquaresMoved <= maxGridSquaresToMove) {
				gridX += this._gridResolution.x;
				gridY += this._gridResolution.y;
				leftOffset = gridX;
				topOffset = gridY;
				gridSquare = gridX + "," + gridY;
				gridSquaresMoved++;
			}
			
			if(!(gridSquare in occupiedGridSquares) && gridSquaresMoved <= maxGridSquaresToMove) {
				topOffset -= this._challengeHeightInEm * index;
				
				graphChallenges.push({
					leftOffsetInPercent: leftOffset,
					topOffsetInEm: topOffset,
					challenge: {
						id: challenge.id,
						owner: challenge.owner.username,
						initialTime: Time.fromUnitString(challenge.options.initialTime, Time.minutes).getUnitString(Time.minutes),
						timeIncrement: Time.fromUnitString(challenge.options.timeIncrement, Time.seconds).getUnitString(Time.seconds)
					}
				});
				
				occupiedGridSquares[gridSquare] = true;
			}
		}).bind(this));
		
		this._template.set("challenges", graphChallenges);
	}
	
	return ChallengeGraph;
});
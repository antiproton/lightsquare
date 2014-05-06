define(function(require) {
	var time = require("lib/time");
	var Event = require("lib/Event");
	var Time = require("chess/Time");
	var ChessClock = require("chess/Clock");
	
	function Clock(server, game, timingStyle) {
		this._server = server;
		this._clock = new ChessClock(game, timingStyle);
		this._serverTimeDifference = 0;
		this._estimateTimeDifference();
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		var timeLeft = this._clock.getTimeLeft(colour);
		
		if(colour === this._game.getPosition.getActiveColour()) {
			timeLeft += this._serverTimeDifference;
		}
		
		return Time.fromMilliseconds(timeLeft);
	}
	
	Clock.prototype._estimateTimeDifference = function() {
		var numberOfRequestsToSend = 3;
		var timeBetweenRequests = 500;
		var timeLastRequestSent;
		var recordedLatencies = [];
		
		this._server.subscribe("/time", (function(serverTime) {
			var now = time();
			var latency = now - timeLastRequestSent;
			
			recordedLatencies.push(latency);
			
			var averageLatency = recordedLatencies.reduce(function(total, current) {
				return total + current;
			}, 0) / recordedLatencies.length;
			
			var estimatedServerTime = serverTime + Math.round(averageLatency / 2);
			 
			this._serverTimeDifference = estimatedServerTime - now;
			
			if(recordedLatencies.length < numberOfRequestsToSend) {
				setTimeout(requestTime, timeBetweenRequests - latency);
			}
		}).bind(this));
		
		var requestTime = (function() {
			this._server.send("/request/time");
			
			timeLastRequestSent = time();
		}).bind(this);
		
		requestTime();
	}
	
	return Clock;
});
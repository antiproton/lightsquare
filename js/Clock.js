define(function(require) {
	var time = require("lib/time");
	var id = require("lib/id");
	var ChessClock = require("chess/Clock");
	
	function Clock(server, game, timingStyle) {
		this._id = id();
		this._server = server;
		this._serverTimeDifference = 0;
		this._estimateTimeDifference();
		
		this._clock = new ChessClock(game, timingStyle, (function() {
			return time() + this._serverTimeDifference;
		}).bind(this));
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		return this._clock.getTimeLeft(colour);
	}
	
	Clock.prototype.calculateTimes = function() {
		this._clock.calculateTimes();
	}
	
	Clock.prototype._estimateTimeDifference = function() {
		var numberOfRequestsToSend = 3;
		var timeBetweenRequests = 500;
		var timeLastRequestSent;
		var recordedLatencies = [];
		
		this._server.subscribe("/time/" + this._id, (function(serverTime) {
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
			this._server.send("/request/time", this._id);
			
			timeLastRequestSent = time();
		}).bind(this);
		
		requestTime();
	}
	
	return Clock;
});
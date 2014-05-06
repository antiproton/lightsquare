define(function(require) {
	var time = require("lib/time");
	var Event = require("lib/Event");
	var Time = require("chess/Time");
	var Colour = require("chess/Colour");
	
	function Clock(server, game) {
		this._server = server;
		this._timingStyle = game.getTimingStyle();
		
		this._moves = game.getHistory();
		
		game.Move.addHandler(this, function(data) {
			this._moves.push(data.move);
		});
		
		this._timeLeft = {};
		this._timeLeft[Colour.white] = Time.fromMilliseconds(this._timingStyle.initialTime);
		this._timeLeft[Colour.black] = Time.fromMilliseconds(this._timingStyle.initialTime);
		
		this._serverTimeDifference = 0;
		this._getLatencyAndTimeDifference();
		this._calculateTime();
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		return Time.fromMilliseconds(this._timeLeft[colour]);
	}
	
	Clock.prototype._getLatencyAndTimeDifference = function() {
		var numberOfRequestsToSend = 3;
		var timeBetweenRequests = 500;
		var timeLastRequestSent;
		var latencies = [];
		
		this._server.subscribe("/time", (function(serverTime) {
			var now = time();
			var latency = now - timeLastRequestSent;
			
			latencies.push(latency);
			
			var averageLatency = latencies.reduce(function(total, current) {
				return total + current;
			}, 0) / latencies.length;
			
			var estimatedServerTime = serverTime + Math.round(averageLatency / 2);
			 
			this._serverTimeDifference = estimatedServerTime - now;
			
			if(latencies.length < numberOfRequestsToSend) {
				setTimeout(requestTime, timeBetweenRequests - latency);
			}
		}).bind(this));
		
		var requestTime = (function() {
			this._server.send("/request/time");
			
			timeLastRequestSent = time();
		}).bind(this);
		
		requestTime();
	}
	
	Clock.prototype._calculateTime = function() {
		/*
		TODO copy this functionality from echochess code
		
		..
		
		setTimeout(do it again)
		*/
	}
	
	Clock.prototype._getEstimatedServerTime = function() {
		return time() + this._serverTimeDifference;
	}
	
	return Clock;
});
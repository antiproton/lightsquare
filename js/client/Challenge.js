define(function(require) {
	function Challenge(server, data) {
		this._server = server;
		
		this._id = data.id;
		this._owner = data.owner;
		this._ownerPlaysAs = data.ownerPlaysAs;
		this._startingFen = data.startingFen;
		this._clockStartDelay = data.clockStartDelay;
		this._clockStartHalfmove = data.clockStartHalfmove;
		this._initialTime = data.initialTime;
		this._timeIncrement = data.timeIncrement;
		this._timingStyle = data.timingStyle;
		this._isOvertime = data.isOvertime;
		this._overtimeFullmove = data.overtimeFullmove;
		this._overtimeBonus = data.overtimeBonus;
		this._isRated = data.isRated;
		
		this.Expired = new Event(this);
		
		this._server.subscribe("/challenge/expired/" + this._id, (function() {
			this.Expired.fire();
		}).bind(this));
	}
	
	Challenge.prototype.accept = function() {
		this._server.send("/challenge/accept", this._id);
	}
	
	return Challenge;
});
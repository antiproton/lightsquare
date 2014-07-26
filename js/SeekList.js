define(function(require) {
	var Event = require("lib/Event");
	require("lib/Array.getShallowCopy");
	
	function SeekList(server) {
		this._server = server;
		this._seeks = [];
		this._isUpdating = false;
		
		this.Updated = new Event();
		
		this._server.subscribe("/open_seeks", (function(seeks) {
			this._seeks = this._seeks.concat(seeks);
			this.Updated.fire();
		}).bind(this));
		
		this._server.subscribe("/open_seek/expired", (function(id) {
			this._seeks = this._seeks.filter(function(seek) {
				return (seek.id !== id);
			});
			
			this.Updated.fire();
		}).bind(this));
	}
	
	SeekList.prototype.getSeeks = function() {
		return this._seeks.getShallowCopy();
	}
	
	SeekList.prototype.startUpdating = function() {
		if(!this._isUpdating) {
			this._server.send("/unignore", "/open_seeks");
			this._server.send("/unignore", "/open_seek/expired");
			this._server.send("/request/open_seeks");
			
			this._isUpdating = true;
		}
	}
	
	SeekList.prototype.stopUpdating = function() {
		if(this._isUpdating) {
			this._seeks = [];
			
			this.Updated.fire();
			
			this._server.send("/ignore", "/open_seeks");
			this._server.send("/ignore", "/open_seek/expired");
			
			this._isUpdating = false;
		}
	}
	
	return SeekList;
});
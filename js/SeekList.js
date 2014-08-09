define(function(require) {
	var Event = require("lib/Event");
	require("Array.prototype/getShallowCopy");
	
	function SeekList(server) {
		this._server = server;
		this._seeks = [];
		this._isUpdating = false;
		this._urls = ["/open_seeks", "/open_seek/new", "/open_seek/expired"];
		
		this.Updated = new Event();
		
		this._server.subscribe("/open_seek/new", (function(seek) {
			this._seeks.push(seek);
			this.Updated.fire();
		}).bind(this));
		
		this._server.subscribe("/open_seeks", (function(seeks) {
			this._seeks = seeks;
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
			this._urls.forEach((function(url) {
				this._server.send("/unignore", url);
			}).bind(this));
			
			this._server.send("/request/open_seeks");
			this._isUpdating = true;
		}
	}
	
	SeekList.prototype.stopUpdating = function() {
		if(this._isUpdating) {
			this._seeks = [];
			
			this.Updated.fire();
			
			this._urls.forEach((function(url) {
				this._server.send("/ignore", url);
			}).bind(this));
			
			this._isUpdating = false;
		}
	}
	
	return SeekList;
});
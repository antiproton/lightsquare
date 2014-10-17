define(function(require) {
	var Event = require("js/Event");
	require("Array.prototype/getShallowCopy");
	
	function SeekList(server) {
		this._server = server;
		this._seeks = [];
		this._isUpdating = false;
		
		this.Updated = new Event();
		
		this._server.subscribe("/list/open_seeks/add", (function(seek) {
			this._seeks.push(seek);
			this.Updated.fire();
		}).bind(this));
		
		this._server.subscribe("/list/open_seeks", (function(seeks) {
			this._seeks = seeks.getShallowCopy();
			this.Updated.fire();
		}).bind(this));
		
		this._server.subscribe("/list/open_seeks/remove", (function(id) {
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
			this._server.send("/feed/activate", "open_seeks");
			this._isUpdating = true;
		}
	}
	
	SeekList.prototype.stopUpdating = function() {
		if(this._isUpdating) {
			this._seeks = [];
			this.Updated.fire();
			this._server.send("/feed/deactivate", "open_seeks");
			this._isUpdating = false;
		}
	}
	
	return SeekList;
});
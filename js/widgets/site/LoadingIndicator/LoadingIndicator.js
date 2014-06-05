define(function(require) {
	require("css!./loadingIndicator.css");
	var html = require("file!./loadingIndicator.html");
	var Ractive = require("lib/dom/Ractive");
	
	function LoadingIndicator(parent, secondsToWait) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				getAbsolutePath: function(path) {
					return require.toUrl(path);
				},
				troubleConnecting: false
			}
		});
		
		setTimeout((function() {
			this._template.set("troubleConnecting", true);
		}).bind(this), secondsToWait * 1000);
	}
	
	LoadingIndicator.prototype.remove = function() {
		this._template.detach();
	}
	
	return LoadingIndicator;
});
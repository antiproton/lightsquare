define(function(require) {
	require("css!./loading_page.css");
	var html = require("file!./loading_page.html");
	var Ractive = require("lib/dom/Ractive");
	
	function LoadingPage(parent, secondsToWait) {
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
	
	return LoadingPage;
});
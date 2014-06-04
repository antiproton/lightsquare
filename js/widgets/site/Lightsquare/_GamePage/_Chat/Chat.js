define(function(require) {
	require("css!./chat.css");
	var html = require("file!./chat.html");
	var Ractive = require("lib/dom/Ractive");
	
	function Chat(game, parent) {
		this._game = game;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				messages: []
			}
		});
	}
	
	return Chat;
});
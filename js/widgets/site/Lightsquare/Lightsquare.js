define(function(require) {
	require("css!./lightsquare.css");
	require("css!./forms.css");
	var html = require("file!./lightsquare.html");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var TabContainer = require("lib/dom/TabContainer");
	var Play = require("./_Play/Play");
	
	function Lightsquare(user, server, parent) {
		this._user = user;
		this._server = server;
		this._router = new Router();
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				tab: "play"
			}
		});
		
		new Play(this._user, this._server, this._template.nodes.play);
	}
	
	return Lightsquare;
});
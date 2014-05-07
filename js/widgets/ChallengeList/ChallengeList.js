define(function(require) {
	require("css!./resources/challenge_list.css");
	var html = require("file!./resources/challenge_list.html");
	var Ractive = require("lib/dom/Ractive");
	var create = require("lib/dom/create");
	
	function ChallengeList(parent, app) {
		this._template = new Ractive({
			el: create("div", parent),
			template: html,
			data: {
				"challenges": {}
			}
		});
		
		this._app = app;
		
		this._app.NewChallenge.addHandler(this, function(data) {
			this._template.set("challenges[" + data.challenge.id + "]", data.challenge);
		});
		
		this._app.ChallengeExpired.addHandler(this, function(data) {
			this._template.set("challenges[" + data.id + "]", undefined);
		});
		
		this._template.on("accept", (function(event) {
			this._app.acceptChallenge(event.context.id);
		}).bind(this));
	}
	
	return ChallengeList;
});
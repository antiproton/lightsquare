define(function(require) {
	require("css@./resources/challenge_list.css");
	var html = require("file@./resources/challenge_list.html");
	var Ractive = require("lib/Ractive");
	var create = require("lib/dom/create");
	
	function ChallengeList(parent, server) {
		this._template = new Ractive({
			el: create("div", parent),
			template: html,
			data: {
				"challenges": {}
			}
		});
		
		this._server = server;
		
		this._server.subscribe("/challenge/list", (function(challenges) {
			this._template.set("challenges", challenges);
		}).bind(this));
		
		this._server.subscribe("/challenge/new", (function(challenge) {
			this._template.set("challenges[" + challenge.id + "]", challenge);
		}).bind(this));
		
		this._server.subscribe("/challenge/expired", (function(id) {
			this._template.set("challenges[" + id + "]", undefined);
		}).bind(this));
		
		this._template.on("accept", (function(event) {
			this._server.send("/challenge/accept", event.context.id);
		}).bind(this));
	}
	
	return ChallengeList;
});
define(function(require) {
	require("css!./challenge_graph.css");
	var html = require("file!./challenge_graph.html");
	var Event = require("lib/Event");
	
	function ChallengeGraph(app, parent) {
		this.AcceptChallenge = new Event(this);
		
		this._app = app;
		this._setupTemplate(parent);
		this._updateTemplate();
	}
	
	ChallengeGraph.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				challenges: this._app.getChallenges(),
				getLeftOffset: function(challenge) {
					console.log("left");
					console.log(challenge);
					console.log("");
				},
				getTopOffset: function(challenge, index) {
					console.log("top");
					console.log(challenge);
					console.log(index);
					console.log("");
				}
			}
		});
		
		this._template.on("accept", (function(event, id) {
			this.AcceptChallenge.fire({
				id: id
			});
		}).bind(this));
		
		this._app.NewChallenge.addHandler(this, function() {
			this._updateTemplate();
		});
		
		this._app.ChallengeExpired.addHandler(this, function() {
			this._updateTemplate();
		});
	}
	
	ChallengeGraph.prototype._updateTemplate = function() {
		this._template.set("challenges", this._app.getChallenges());
	}
	
	return ChallengeGraph;
});
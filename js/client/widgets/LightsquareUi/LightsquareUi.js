define(function(require) {
	require("css!./resources/lightsquare_ui.css");
	var html = require("file!./resources/lightsquare_ui.html");
	var Template = require("lib/dom/Template");
	var ChallengeList = require("widgets/ChallengeList/ChallengeList");
	var Game = require("widgets/Game/Game");
	
	function LightSquareUi(parent, app) {
		this._app = app;
		this._template = new Template(html, parent);
		
		this._challengeList = new ChallengeList(this._template.challenge_list, this._app);
		
		this._template.new_challenge.addEventListener("click", (function() {
			this._app.createChallenge({});
		}).bind(this));
		
		this._app.NewGame.addHandler(this, function(data) {
			var game = new Game(data.game, this._template.game);
		});
	}
	
	return LightSquareUi;
});
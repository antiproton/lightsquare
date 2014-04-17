define(function(require) {
	var html = require("file!./resources/home_page.html");
	var challengeListHtml = require("file!./resources/challenge_list.html");
	var Template = require("lib/dom/Template");
	require("css!./resources/home_page.css");
	var Board = require("widgets/Board/Board");
	var Ractive = require("lib/dom/Ractive");
	
	function HomePage(app, parent) {
		this._template = new Template(html, parent);
		
		this._board = new Board(this._template.random_game);
		this._board.setSquareSize(60);
		this._board.setShowCoords(false);
		this._board.setSquareStyle(Board.squareStyles.GREEN);
		
		this._challengeList = new Ractive({
			el: this._template.challenge_list,
			template: challengeListHtml,
			data: {
				"games": []
			}
		});
		
		app.ChallengeExpired.addHandler(this, function(data) {
			this._challengeList.set("games", this._challengeList.get("games").filter(function(challenge) {
				return (challenge.id !== data.id);
			}));
		});
	}
	
	return HomePage;
});
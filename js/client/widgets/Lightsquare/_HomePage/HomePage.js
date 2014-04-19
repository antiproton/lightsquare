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
		
		this._template.quick_challenge_form.addEventListener("submit", (function(event) {
			event.preventDefault();
			
			app.createChallenge({
				initialTime: this._template.quick_challenge_initial_time.value,
				timeIncrement: this._template.quick_challenge_increment.value,
				acceptRatingMin: this._template.quick_challenge_rating_min.value,
				acceptRatingMax: this._template.quick_challenge_rating_max.value
			});
		}).bind(this));
		
		this._challengeList = new Ractive({
			el: this._template.challenge_list,
			template: challengeListHtml,
			data: {
				"challenges": app.getChallenges()
			}
		});
		
		this._challengeList.on("accept", function(event) {
			app.acceptChallenge(event.context.id);
		});
		
		app.NewChallenge.addHandler(this, function(data) {
			this._challengeList.get("challenges").push(data.challenge);
		});
		
		app.ChallengeExpired.addHandler(this, function(data) {
			this._challengeList.set("challenges", this._challengeList.get("challenges").filter(function(challenge) {
				return (challenge.id !== data.id);
			}));
		});
	}
	
	return HomePage;
});
define(function(require) {
	var html = require("file!./home_page.html");
	var challengeListHtml = require("file!./challenge_list.html");
	var loginForm = require("file!./login_form.html");
	var createChallengeFormHtml = require("file!./create_challenge_form.html");
	var Template = require("lib/dom/Template");
	require("css!./home_page.css");
	var Board = require("widgets/Board/Board");
	var Ractive = require("lib/dom/Ractive");
	var Time = require("chess/Time");
	
	function HomePage(app, user, parent) {
		this._app = app;
		this._user = user;
		this._template = new Template(html, parent);
		
		this._setupLoginForm();
		this._setupBoard();
		this._setupCreateChallengeForm();
		this._setupChallengeList();
	}
	
	HomePage.prototype._setupLoginForm = function() {
		this._loginForm = new Ractive({
			el: this._template.login_form,
			template: loginForm,
			data: {}
		});
		
		this._loginForm.on("login", (function(event, username, password) {
			event.original.preventDefault();
			
			this._user.login(username, password);
		}).bind(this));
		
		this._loginForm.on("register", (function(event, username, password) {
			event.original.preventDefault();
			
			this._user.register(username, password);
		}).bind(this));
	}
	
	HomePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.random_game);
		this._board.setSquareSize(60);
		this._board.setShowCoords(false);
		this._board.setSquareStyle(Board.squareStyles.GREEN);
	}
	
	HomePage.prototype._setupCreateChallengeForm = function() {
		this._createChallengeForm = new Ractive({
			el: this._template.create_challenge,
			template: createChallengeFormHtml,
			data: {
				initialTime: "10m",
				timeIncrement: "5",
				ratingMin: "-100",
				ratingMax: "+100"
			}
		});
		
		this._createChallengeForm.on("submit", (function(event, initialTime, timeIncrement, ratingMin, ratingMax) {
			event.original.preventDefault();
			
			this._user.createChallenge({
				initialTime: initialTime,
				timeIncrement: timeIncrement,
				acceptRatingMin: ratingMin,
				acceptRatingMax: ratingMax
			});
		}).bind(this));
	}
	
	HomePage.prototype._setupChallengeList = function() {
		this._challengeList = new Ractive({
			el: this._template.challenge_list,
			template: challengeListHtml,
			data: {
				"challenges": this._app.getChallenges()
			}
		});
		
		this._challengeList.on("accept", (function(event, id) {
			this._user.acceptChallenge(id);
		}).bind(this));
		
		this._app.NewChallenge.addHandler(this, function(data) {
			this._challengeList.get("challenges").push(data.challenge);
		});
		
		this._app.ChallengeExpired.addHandler(this, function(data) {
			this._challengeList.set("challenges", this._challengeList.get("challenges").filter(function(challenge) {
				return (challenge.id !== data.id);
			}));
		});
	}
	
	return HomePage;
});
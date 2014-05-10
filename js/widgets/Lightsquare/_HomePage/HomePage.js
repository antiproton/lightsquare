define(function(require) {
	var html = require("file!./home_page.html");
	var challengeListHtml = require("file!./challenge_list.html");
	var loginForm = require("file!./login_form.html");
	var Template = require("lib/dom/Template");
	require("css!./home_page.css");
	require("css!./login_form.css");
	var Board = require("widgets/Board/Board");
	var Ractive = require("lib/dom/Ractive");
	
	function HomePage(app, user, parent) {
		this._app = app;
		this._user = user;
		this._template = new Template(html, parent);
		
		this._setupLoginForm();
		this._setupBoard();
		this._setupQuickChallengeForm();
		this._setupChallengeList();
	}
	
	HomePage.prototype._setupLoginForm = function() {
		this._loginForm = new Ractive({
			el: this._template.login_form,
			template: loginForm,
			data: {}
		});
		
		this._loginForm.on("login", (function(event) {
			event.original.preventDefault();
			
			this._user.login(this._loginForm.get("login_username"), this._loginForm.get("login_password"));
		}).bind(this));
		
		this._loginForm.on("register", (function(event) {
			event.original.preventDefault();
			
			this._user.register(this._loginForm.get("login_username"), this._loginForm.get("login_passwordd"));
		}).bind(this));
	}
	
	HomePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.random_game);
		this._board.setSquareSize(60);
		this._board.setShowCoords(false);
		this._board.setSquareStyle(Board.squareStyles.GREEN);
	}
	
	HomePage.prototype._setupQuickChallengeForm = function() {
		this._template.quick_challenge_form.addEventListener("submit", (function(event) {
			event.preventDefault();
			
			this._user.createChallenge({
				initialTime: this._template.quick_challenge_initial_time.value,
				timeIncrement: this._template.quick_challenge_increment.value,
				acceptRatingMin: this._template.quick_challenge_rating_min.value,
				acceptRatingMax: this._template.quick_challenge_rating_max.value
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
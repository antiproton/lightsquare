define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var loginFormHtml = require("file!./login_form.html");
	var createChallengeFormHtml = require("file!./create_challenge_form.html");
	var Template = require("lib/dom/Template");
	var Board = require("widgets/Board/Board");
	var Ractive = require("lib/dom/Ractive");
	var Time = require("chess/Time");
	var ChallengeGraph = require("widgets/ChallengeGraph/ChallengeGraph");
	
	function HomePage(app, user, parent) {
		this._app = app;
		this._user = user;
		this._template = new Template(html, parent);
		
		this._setupLoginForm();
		this._setupBoard();
		this._setupCreateChallengeForm();
		this._setupChallengeGraph();
	}
	
	HomePage.prototype._setupLoginForm = function() {
		this._loginForm = new Ractive({
			el: this._template.login_form,
			template: loginFormHtml,
			data: {
				register: false
			}
		});
		
		this._loginForm.on("submit", (function(event, username, password) {
			event.original.preventDefault();
			
			if(this._loginForm.get("register")) {
				this._user.register(username, password);
			}
			
			else {
				this._user.login(username, password);
			}
		}).bind(this));
		
		this._loginForm.on("login", (function(event, username, password) {
			this._loginForm.set("register", false);
		}).bind(this));
		
		this._loginForm.on("register", (function(event, username, password) {
			this._loginForm.set("register", true);
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
	
	HomePage.prototype._setupChallengeGraph = function() {
		this._challengeGraph = new ChallengeGraph(this._app, this._template.challenge_graph);
		
		this._challengeGraph.AcceptChallenge.addHandler(this, function(data) {
			this._user.acceptChallenge(data.id);
		});
	}
	
	return HomePage;
});
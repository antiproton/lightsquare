define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var Template = require("lib/dom/Template");
	var Board = require("widgets/Board/Board");
	var Ractive = require("lib/dom/Ractive");
	var Time = require("chess/Time");
	var CreateChallengeForm = require("./_CreateChallengeForm/CreateChallengeForm");
	var ChallengeGraph = require("./_ChallengeGraph/ChallengeGraph");
	var LoginForm = require("./_LoginForm/LoginForm");
	
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
		this._loginForm = new LoginForm(this._user, this._template.login_form);
	}
	
	HomePage.prototype._setupBoard = function() {
		this._board = new Board(this._template.random_game);
		this._board.setSquareSize(60);
		this._board.setShowCoords(false);
		this._board.setSquareStyle(Board.squareStyles.GREEN);
	}
	
	HomePage.prototype._setupCreateChallengeForm = function() {
		this._createChallengeForm = new CreateChallengeForm(this._user, this._template.create_challenge);
	}
	
	HomePage.prototype._setupChallengeGraph = function() {
		this._challengeGraph = new ChallengeGraph(this._app, this._user, this._template.challenge_graph);
	}
	
	return HomePage;
});
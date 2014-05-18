define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var Template = require("lib/dom/Template");
	var CreateChallengeForm = require("./_CreateChallengeForm/CreateChallengeForm");
	var ChallengeGraph = require("./_ChallengeGraph/ChallengeGraph");
	var LoginForm = require("./_LoginForm/LoginForm");
	
	function HomePage(app, user, parent) {
		this._app = app;
		this._user = user;
		this._template = new Template(html, parent);
		
		this._setupLoginForm();
		this._setupCreateChallengeForm();
		this._setupChallengeGraph();
	}
	
	HomePage.prototype._setupLoginForm = function() {
		this._loginForm = new LoginForm(this._user, this._template.login_form);
	}
	
	HomePage.prototype._setupCreateChallengeForm = function() {
		this._createChallengeForm = new CreateChallengeForm(this._user, this._template.create_challenge);
	}
	
	HomePage.prototype._setupChallengeGraph = function() {
		this._challengeGraph = new ChallengeGraph(this._app, this._user, this._template.challenge_graph);
	}
	
	return HomePage;
});
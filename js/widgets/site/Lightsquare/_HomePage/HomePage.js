define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var Ractive = require("lib/dom/Ractive");
	var CreateChallengeForm = require("./_CreateChallengeForm/CreateChallengeForm");
	var ChallengeGraph = require("./_ChallengeGraph/ChallengeGraph");
	var LoginForm = require("./_LoginForm/LoginForm");
	
	function HomePage(app, user, parent) {
		this._app = app;
		this._user = user;
		
		this._setupTemplate(parent);
		this._handleUserEvents();

		this._user.getDetails().then((function() {
			this._updateUserDependentElements();
		}).bind(this));
	}
	
	HomePage.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				showModalDialog: {
					restoreGame: false
				},
				userIsLoggedIn: this._user.isLoggedIn()
			}
		});
		
		this._loginForm = new LoginForm(this._user, this._template.nodes.login_form);
		this._createChallengeForm = new CreateChallengeForm(this._user, this._template.nodes.create_challenge);
		this._challengeGraph = new ChallengeGraph(this._app, this._user, this._template.nodes.challenge_graph);
		
		this._template.on("restore_game", (function() {
			this._showModalDialog("restoreGame");
		}).bind(this));
		
		this._template.on("hide_modal_dialog", (function() {
			this._hideModalDialog();
		}).bind(this));
	}
	
	HomePage.prototype._showModalDialog = function(dialog) {
		this._template.set("showModalDialog." + dialog, true);
		this._template.set("showModalOverlay", true);
	}
	
	HomePage.prototype._hideModalDialog = function() {
		for(var dialog in this._template.get("showModalDialog")) {
			this._template.set("showModalDialog." + dialog, false);
		}
		
		this._template.set("showModalOverlay", false);
	}
	
	HomePage.prototype._handleUserEvents = function() {
		this._user.LoggedIn.addHandler(this, function() {
			this._updateUserDependentElements();
		});
		
		this._user.LoggedOut.addHandler(this, function() {
			this._updateUserDependentElements();
		});
	}
	
	HomePage.prototype._updateUserDependentElements = function() {
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
	}
	
	return HomePage;
});
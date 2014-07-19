define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var Ractive = require("lib/dom/Ractive");
	var CreateChallengeForm = require("./_CreateChallengeForm/CreateChallengeForm");
	var ChallengeGraph = require("./_ChallengeGraph/ChallengeGraph");
	var LoginForm = require("./_LoginForm/LoginForm");
	var GameBackupList = require("./_GameBackupList/GameBackupList");
	var ChallengeList = require("ChallengeList");
	var RegisterForm = require("./_RegisterForm/RegisterForm");
	
	function HomePage(user, server, parent) {
		this._challengeList = new ChallengeList(server);
		this._user = user;
		this._setupTemplate(parent);
		this._handleUserEvents();
	}
	
	HomePage.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				tab: "home",
				dialog: null,
				username: this._user.getUsername(),
				userIsLoggedIn: this._user.isLoggedIn(),
				registered: false
			}
		});
		
		new LoginForm(this._user, this._template.nodes.login_form);
		new CreateChallengeForm(this._user, this._template.nodes.create_challenge);
		new ChallengeGraph(this._challengeList, this._user, this._template.nodes.challenge_graph);
		
		var registerForm = new RegisterForm(this._user, this._template.nodes.register_form);
		
		registerForm.Registered.addHandler(this, function() {
			this._template.set("registered", true);
		});
		
		this._gameBackupList = new GameBackupList(this._user, this._template.nodes.game_backup_list);
		
		this._gameBackupList.GameRestored.addHandler(this, function() {
			if(this._template.get("showDialog") === "restoreGame") {
				this._hideDialog();
			}
		});
		
		this._template.on("select_tab", (function(event, tab) {
			this._template.set("tab", tab);
		}).bind(this));
		
		this._template.on("restore_game", (function() {
			this._showDialog("restoreGame");
			this._gameBackupList.refresh();
		}).bind(this));
		
		var lastClickWasOnDialog = false;
		
		this._template.on("hide_dialog", (function() {
			if(!lastClickWasOnDialog) {
				this._hideDialog();
			}
			
			lastClickWasOnDialog = false;
		}).bind(this));
		
		this._template.on("dialog_click", function() {
			lastClickWasOnDialog = true;
		});
		
		this._template.on("register", (function() {
			this._showDialog("register");
		}).bind(this));
		
		this._template.on("register_done", (function() {
			this._hideDialog();
			this._template.set("registered", false);
		}).bind(this));
	}
	
	HomePage.prototype._showDialog = function(dialog) {
		this._template.set("dialog", dialog);
	}
	
	HomePage.prototype._hideDialog = function() {
		this._template.set("dialog", null);
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
		this._template.set("username", this._user.getUsername());
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
	}
	
	HomePage.prototype.show = function() {
		this._challengeList.startUpdating();
	}
	
	HomePage.prototype.hide = function() {
		this._challengeList.stopUpdating();
	}
	
	return HomePage;
});
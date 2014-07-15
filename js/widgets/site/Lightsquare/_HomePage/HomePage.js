define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var Ractive = require("lib/dom/Ractive");
	var CreateChallengeForm = require("./_CreateChallengeForm/CreateChallengeForm");
	var ChallengeGraph = require("./_ChallengeGraph/ChallengeGraph");
	var LoginForm = require("./_LoginForm/LoginForm");
	var GameBackupList = require("./_GameBackupList/GameBackupList");
	
	function HomePage(challengeList, user, parent) {
		this._challengeList = challengeList;
		this._user = user;
		
		this._setupTemplate(parent);
		this._handleUserEvents();
	}
	
	HomePage.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				showModalDialog: null,
				userIsLoggedIn: this._user.isLoggedIn()
			}
		});
		
		new LoginForm(this._user, this._template.nodes.login_form);
		new CreateChallengeForm(this._user, this._template.nodes.create_challenge);
		new ChallengeGraph(this._challengeList, this._user, this._template.nodes.challenge_graph);
		this._gameBackupList = new GameBackupList(this._user, this._template.nodes.game_backup_list);
		
		this._gameBackupList.GameRestored.addHandler(this, function() {
			if(this._template.get("showModalDialog") === "restoreGame") {
				this._hideModalDialog();
			}
		});
		
		this._template.on("restore_game", (function() {
			this._showModalDialog("restoreGame");
			this._gameBackupList.refresh();
		}).bind(this));
		
		var lastClickWasOnDialog = false;
		
		this._template.on("hide_modal_dialog", (function() {
			if(!lastClickWasOnDialog) {
				this._hideModalDialog();
			}
			
			lastClickWasOnDialog = false;
		}).bind(this));
		
		this._template.on("dialog_click", function() {
			lastClickWasOnDialog = true;
		});
	}
	
	HomePage.prototype._showModalDialog = function(dialog) {
		this._template.set("showModalDialog", dialog);
	}
	
	HomePage.prototype._hideModalDialog = function() {
		this._template.set("showModalDialog", null);
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
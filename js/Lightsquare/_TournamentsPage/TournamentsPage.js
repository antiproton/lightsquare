define(function(require) {
	require("css!./tournaments_page.css");
	var html = require("file!./tournaments_page.html");
	var RactiveI18n = require("ractive-i18n/RactiveI18n");
	
	var ESCAPE_KEY = 27;
	
	function TournamentsPage(user, parent) {
		this._user = user;
		this._setupTemplate(parent);
	}
	
	TournamentsPage.prototype._setupTemplate = function(parent) {
		this._template = new RactiveI18n({
			el: parent,
			template: html,
			data: {
				locale: this._user.getLocaleDictionary(),
				dialog: null,
				name: "",
				initialTime: "3m",
				timeIncrement: "2",
				players: 8
			}
		});
		
		this._template.on("open_create_dialog", (function() {
			this._showDialog("create");
		}).bind(this));
		
		this._setupDialogHandlers();
	}
	
	TournamentsPage.prototype._setupDialogHandlers = function() {
		var foregroundClicked = false;
		
		this._template.on("background_click", (function() {
			if(!foregroundClicked) {
				this._hideDialog();
			}
			
			foregroundClicked = false;
		}).bind(this));
		
		this._template.on("foreground_click", (function() {
			foregroundClicked = true;
		}).bind(this));
		
		window.addEventListener("keyup", (function(event) {
			if(event.keyCode === ESCAPE_KEY) {
				this._hideDialog();
			}
		}).bind(this));
	}
	
	TournamentsPage.prototype._showDialog = function(dialog) {
		this._template.set("dialog", dialog);
	}
	
	TournamentsPage.prototype._hideDialog = function(dialog) {
		if(!dialog || this._template.get("dialog") === dialog) {
			this._template.set("dialog", null);
		}
	}
	
	return TournamentsPage;
});
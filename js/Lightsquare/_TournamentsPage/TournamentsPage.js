define(function(require) {
	require("css!./tournaments_page.css");
	var html = require("file!./tournaments_page.html");
	var RactiveI18n = require("ractive-i18n/RactiveI18n");
	
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
				dialog: null
			}
		});
		
		this._template.on("open_create_form", (function() {
			this._showDialog("create");
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
define(function(require) {
	require("css!./profile_page.css");
	var html = require("file!./profile_page.html");
	var Ractive = require("lib/dom/Ractive");
	
	function ProfilePage(user, parent) {
		this._user = user;
		
		this._template = new Ractive({
			template: html,
			el: parent,
			data: {
				user: this._user
			}
		});
		
		this._user.DetailsChanged.addHandler(this, function() {
			this._template.update();
		});
		
		this._user.HasIdentity.addHandler(this, function() {
			this._template.update();
		});
	}
	
	return ProfilePage;
});
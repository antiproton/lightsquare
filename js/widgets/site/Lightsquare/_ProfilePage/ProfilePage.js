define(function(require) {
	require("css!./profile_page.css");
	var html = require("file!./profile_page.html");
	var Template = require("lib/dom/Template");
	
	function ProfilePage(parent) {
		this._template = new Template(html, parent);
	}
	
	return ProfilePage;
});
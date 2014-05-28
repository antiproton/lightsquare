define(function(require) {
	require("css!./about_page.css");
	var html = require("file!./about_page.html");
	var Template = require("lib/dom/Template");
	
	function AboutPage(parent) {
		this._template = new Template(html, parent);
	}
	
	return AboutPage;
});
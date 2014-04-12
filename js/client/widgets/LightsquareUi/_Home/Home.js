define(function(require) {
	var html = require("file!./resources/home.html");
	var Template = require("lib/dom/Template");
	require("css!./resources/home.css");
	
	function Home(app, parent) {
		this._template = new Template(html, parent);
	}
	
	return Home;
});
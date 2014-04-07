define(function(require) {
	var html = require("file!./resources/play.html");
	var Template = require("lib/dom/Template");
	
	function Play(app, parent) {
		this._template = new Template(html, parent);
	}
	
	return Play;
});
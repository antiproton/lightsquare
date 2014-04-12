define(function(require) {
	var html = require("file!./resources/login_form.html");
	var Ractive = require("lib/dom/Ractive");
	require("css!./resources/login_form.css");
	var Event = require("lib/Event");
	
	function LoginForm(parent) {
		this._template = new Ractive({
			template: html,
			el: parent
		});
		
		this._template.on("submit", (function() {
			this.Submitted.fire({
				username: this._template.get("username"),
				password: this._template.get("password")
			});
		}).bind(this));
		
		this.Submitted = new Event(this);
	}
	
	return LoginForm;
});
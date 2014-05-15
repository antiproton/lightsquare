define(function(require) {
	require("css!./login_form.css");
	var html = require("file!./login_form.html");
	var Ractive = require("lib/dom/Ractive");
	
	function LoginForm(user, parent) {
		this._user = user;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				register: false
			}
		});
		
		this._template.on("submit", (function(event, username, password) {
			event.original.preventDefault();
			
			if(this._template.get("register")) {
				this._user.register(username, password);
			}
			
			else {
				this._user.login(username, password);
			}
		}).bind(this));
		
		this._template.on("login", (function(event, username, password) {
			this._template.set("register", false);
		}).bind(this));
		
		this._template.on("register", (function(event, username, password) {
			this._template.set("register", true);
		}).bind(this));
	}
	
	return LoginForm;
});
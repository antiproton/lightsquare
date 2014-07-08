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
				error: ""
			}
		});
		
		this._template.on("submit", (function(event) {
			event.original.preventDefault();
			
			this._clearError();
			
			var username = (this._template.get("username") || "").toString();
			var password = (this._template.get("password") || "").toString();
			
			this._user.login(username, password).then((function() {
				this._clearForm();
			}).bind(this), (function(reason) {
				this._setError(reason);
			}).bind(this));
		}).bind(this));
	}
	
	LoginForm.prototype._clearForm = function() {
		this._template.set("username", "");
		this._template.set("password", "");
	}
	
	LoginForm.prototype._clearError = function() {
		this._template.set("error", "");
	}
	
	LoginForm.prototype._setError = function(message) {
		this._template.set("error", message);
	}
	
	return LoginForm;
});
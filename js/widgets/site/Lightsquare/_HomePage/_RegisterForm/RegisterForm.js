define(function(require) {
	require("css!./register_form.css");
	var html = require("file!./register_form.html");
	var Ractive = require("lib/dom/Ractive");
	var Event = require("lib/Event");
	
	function RegisterForm(user, parent) {
		this._user = user;
		
		this.Registered = new Event(this);
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				error: "",
				username: "",
				password: "",
				password_confirm: ""
			}
		});
		
		this._template.on("submit", (function(event) {
			event.original.preventDefault();
			
			this._clearError();
			
			var username = this._template.get("username") + "";
			var password = this._template.get("password") + "";
			var password_confirm = this._template.get("password_confirm") + "";
			
			if(password_confirm.length > 0 && password !== password_confirm) {
				this._setError("Password confirmation supplied and doesn't match password");
			}
			
			else {
				this._user.register(username, password).then((function() {
					this._clearForm();
					this.Registered.fire();
				}).bind(this), (function(error) {
					this._setError(error);
				}).bind(this));
			}
		}).bind(this));
	}
	
	RegisterForm.prototype._clearForm = function() {
		this._template.set("username", "");
		this._template.set("password", "");
		this._template.set("password_confirm", "");
	}
	
	RegisterForm.prototype._clearError = function() {
		this._template.set("error", "");
	}
	
	RegisterForm.prototype._setError = function(message) {
		this._template.set("error", message);
	}
	
	return RegisterForm;
});
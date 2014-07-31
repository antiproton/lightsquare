define(function(require) {
	require("css!./lightsquare.css");
	require("css!./forms.css");
	var html = require("file!./lightsquare.html");
	var homeHtml = require("file!./home.html");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/routing/Router");
	var Path = require("lib/routing/Path");
	var TabContainer = require("lib/dom/TabContainer");
	var Play = require("./_Play/Play");
	
	var LEFT_BUTTON = 0;
	
	function Lightsquare(user, server, parent) {
		this._user = user;
		this._server = server;
		this._path = new Path();
		this._router = new Router(this._path);
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				tab: "play",
				navLinks: {
					"/": "Home",
					"/play": "Live chess",
					"/tools": "Tools"
				}
			},
			partials: {
				home: homeHtml
			}
		});
		
		this._template.on("navigate", (function(event) {
			if(event.original.button === LEFT_BUTTON) {
				event.original.preventDefault();
			
				this._router.setPath(event.node.getAttribute("href"));
			}
		}).bind(this));
		
		this._router.addRoute("/", (function() {
			this._showTab("home");
		}).bind(this));
		
		this._router.addRoute("/play", (function() {
			this._showTab("play");
		}).bind(this));
		
		this._router.addRoute("/tools", (function() {
			this._showTab("tools");
		}).bind(this));
		
		new Play(this._user, this._server, new Router(this._path, "/play"), this._template.nodes.play);
		
		this._router.execute();
	}
	
	Lightsquare.prototype._showTab = function(tab) {
		this._template.set("tab", tab);
	}
	
	return Lightsquare;
});
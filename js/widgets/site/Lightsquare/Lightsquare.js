define(function(require) {
	require("css!./lightsquare.css");
	require("css!./forms.css");
	var html = require("file!./lightsquare.html");
	var homeHtml = require("file!./home.html");
	var toolsHtml = require("file!./tools.html");
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
		
		var path = this._router.getPath();
		
		this._router.PathChanged.addHandler(function(path) {
			this._template.set("currentPath", path);
		}, this);
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				currentPath: path,
				tab: path,
				navLinks: {
					"/": "Home",
					"/play": "Live chess",
					"/tools": "Tools"
				},
				getHref: (function(path) {
					return this._router.getAbsolutePath(path);
				}).bind(this)
			},
			partials: {
				home: homeHtml,
				tools: toolsHtml
			}
		});
		
		this._template.on("navigate", (function(event) {
			if(event.original.button === LEFT_BUTTON) {
				event.original.preventDefault();
			
				var path = this._router.getRelativePath(event.node.getAttribute("href"));
				
				if(path) {
					this._router.setPath(path);
				}
			}
		}).bind(this));
		
		this._router.addRoute("/", (function() {
			this._template.set("tab", "/");
		}).bind(this));
		
		this._router.addPartialRoute("/play", (function() {
			this._template.set("tab", "/play");
		}).bind(this));
		
		this._router.addPartialRoute("/tools", (function() {
			this._template.set("tab", "/tools");
		}).bind(this));
		
		new Play(this._user, this._server, new Router(this._path, "/play"), this._template.nodes.play);
		
		this._router.execute();
	}
	
	return Lightsquare;
});
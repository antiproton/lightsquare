define(function(require) {
	require("css!./lightsquare.css");
	require("css!./forms.css");
	require("css!./tools.css");
	var html = require("file!./lightsquare.html");
	var homeHtml = require("file!./home.html");
	var toolsHtml = require("file!./tools.html");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/routing/Router");
	var AddressBarPath = require("lib/routing/AddressBarPath");
	var TabContainer = require("lib/dom/TabContainer");
	var Play = require("./_Play/Play");
	var GameBackupList = require("./_GameBackupList/GameBackupList");
	
	var LEFT_BUTTON = 0;
	
	function Lightsquare(user, server, parent) {
		this._user = user;
		this._server = server;
		this._router = new Router(new AddressBarPath());
		
		this._setupTemplate(parent);
		this._setupRouter();
		this._setupUser();
		
		new Play(this._user, this._server, this._router.createChild("/play"), this._template.nodes.play);
		this._gameBackupList = new GameBackupList(this._user, this._server, this._template.nodes.restore_game);
		
		this._router.execute();
	}
	
	Lightsquare.prototype._updateUserDetails = function() {
		this._template.set({
			username: this._user.getUsername(),
			userIsLoggedIn: this._user.isLoggedIn()
		});
	}
	
	Lightsquare.prototype._setupUser = function() {
		this._server.Connected.addHandler(function() {
			this._user.getDetails().then((function() {
				this._updateUserDetails();
			}).bind(this));
		}, this);
		
		this._user.LoggedIn.addHandler(function() {
			this._updateUserDetails();
		}, this);
		
		this._user.LoggedOut.addHandler(function() {
			this._updateUserDetails();
		}, this);
	}
	
	Lightsquare.prototype._setupRouter = function() {
		this._router.PathChanged.addHandler(function(path) {
			this._template.set("currentPath", this._router.getPath());
		}, this);
		
		this._router.addRoute("/", (function() {
			this._template.set("tab", "/");
		}).bind(this));
		
		this._router.addPartialRoute("/play", (function() {
			this._template.set("tab", "/play");
		}).bind(this));
		
		this._router.addRoute("/tools", (function() {
			this._template.set("tab", "/tools");
			this._gameBackupList.refresh();
		}).bind(this));
	}
	
	Lightsquare.prototype._setupTemplate = function(parent) {
		var path = this._router.getPath();
		
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
				toolsTabs: {
					restoreGame: "Restore game"
				},
				toolsTab: "restoreGame",
				getHref: (function(path) {
					return this._router.getAbsolutePath(path);
				}).bind(this)
			},
			partials: {
				home: homeHtml,
				tools: toolsHtml
			}
		});
		
		this._template.on("select_tools_tab", (function(event, tab) {
			this._template.set("toolsTab", tab);
		}).bind(this));
		
		this._template.on("navigate", (function(event) {
			if(event.original.button === LEFT_BUTTON) {
				event.original.preventDefault();
			
				var path = this._router.getRelativePath(event.node.getAttribute("href"));
				
				if(path) {
					this._router.setPath(path);
				}
			}
		}).bind(this));
	}
	
	return Lightsquare;
});
define(function(require) {
	require("css!./base.css");
	require("css!./lightsquare.css");
	require("css!./forms.css");
	require("css!./tools.css");
	require("css!./home.css");
	var html = require("file!./lightsquare.html");
	var homeHtml = require("file!./home.html");
	var toolsHtml = require("file!./tools.html");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/routing/Router");
	var AddressBarPath = require("lib/routing/AddressBarPath");
	var TabContainer = require("lib/dom/TabContainer");
	var Play = require("./_Play/Play");
	var GameBackupList = require("./_GameBackupList/GameBackupList");
	var LoginForm = require("./_LoginForm/LoginForm");
	var RegisterForm = require("./_RegisterForm/RegisterForm");
	var CurrentGames = require("./_CurrentGames/CurrentGames");
	var RandomGames = require("RandomGames");
	
	var LEFT_BUTTON = 0;
	var ESCAPE_KEY = 27;
	
	function Lightsquare(user, server, parent) {
		this._user = user;
		this._server = server;
		this._router = new Router(new AddressBarPath());
		
		this._setupTemplate(parent);
		this._setupRouter();
		this._setupUser();
		
		this._setupLoginForm();
		this._setupLogoutLink();
		this._setupRegisterForm();
		this._setupPages();
		this._setupCurrentGames();
		this._setupOverlayHandlers();
		
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
			this._currentGames.startUpdating();
		}).bind(this), (function() {
			this._currentGames.stopUpdating();
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
				dialog: null,
				showLogoutConfirmation: false,
				currentPath: path,
				tab: path,
				navLinks: {
					"/": "Home",
					"/play": "Play",
					"/tools": "Tools"
				},
				toolsTabs: {
					restoreGame: "Restore game"
				},
				toolsTab: "restoreGame",
				getHref: (function(path) {
					return this._router.getAbsolutePath(path);
				}).bind(this),
				registered: false
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
	
	Lightsquare.prototype._setupOverlayHandlers = function() {
		var foregroundClicked = false;
		
		this._template.on("background_click", (function() {
			if(!foregroundClicked) {
				this._hideOverlays();
			}
			
			foregroundClicked = false;
		}).bind(this));
		
		this._template.on("foreground_click", (function() {
			foregroundClicked = true;
		}).bind(this));
		
		window.addEventListener("keyup", (function(event) {
			if(event.keyCode === ESCAPE_KEY) {
				this._hideOverlays();
			}
		}).bind(this));
	}
	
	Lightsquare.prototype._hideOverlays = function() {
		this._hideDialog();
		this._template.set("showLogoutConfirmation", false);
	}
	
	Lightsquare.prototype._showDialog = function(dialog) {
		this._template.set("dialog", dialog);
	}
	
	Lightsquare.prototype._hideDialog = function() {
		this._template.set("dialog", null);
	}
	
	Lightsquare.prototype._setupPages = function() {
		new Play(this._user, this._server, this._router.createChild("/play"), this._template.nodes.play);
		this._gameBackupList = new GameBackupList(this._user, this._server, this._template.nodes.restore_game);
	}
	
	Lightsquare.prototype._setupLoginForm = function() {
		new LoginForm(this._user, this._template.nodes.login_form);
	}
	
	Lightsquare.prototype._setupRegisterForm = function() {
		var registerForm = new RegisterForm(this._user, this._template.nodes.register_form);
		
		registerForm.Registered.addHandler(function(data) {
			this._template.set("registered", true);
			this._template.set("registerAutoLoggedIn", data.loggedIn);
			this._template.set("registeredUsername", data.registeredUsername);
		}, this);
		
		this._template.on("register", (function() {
			this._showDialog("register");
		}).bind(this));
		
		this._template.on("register_done", (function() {
			this._hideDialog();
			this._template.set("registered", false);
		}).bind(this));
	}
	
	Lightsquare.prototype._setupCurrentGames = function() {
		this._currentGames = new CurrentGames(new RandomGames(this._server), this._template.nodes.current_games);
		
		this._currentGames.ClickGame.addHandler(function(id) {
			this._router.setPath("/play/game/" + id);
		}, this);
	}
	
	Lightsquare.prototype._setupLogoutLink = function() {
		this._template.on("logout", (function() {
			if(this._user.hasGamesInProgress()) {
				this._template.set("showLogoutConfirmation", true);
			}
			
			else {
				this._user.logout();
			}
		}).bind(this));
		
		this._template.on("logout_confirm", (function() {
			this._user.logout();
			this._template.set("showLogoutConfirmation", false);
		}).bind(this));
		
		this._template.on("logout_cancel", (function() {
			this._template.set("showLogoutConfirmation", false);
		}).bind(this));
	}
	
	return Lightsquare;
});
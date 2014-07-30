define(function(require) {
	require("lib/Array.empty");
	require("css!./play.css");
	require("css!./nav.css");
	var html = require("file!./play.html");
	var navHtml = require("file!./nav.html");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var TabContainer = require("lib/dom/TabContainer");
	var HomePage = require("./_HomePage/HomePage");
	var GamePage = require("./_GamePage/GamePage");
	var Colour = require("chess/Colour");
	
	var MouseButtons = {
		left: 0,
		middle: 1
	};
	
	function Play(user, server, parent) {
		this._server = server;
		this._user = user;
		
		this._pages = {};
		this._gamePages = [];
		this._gamePageIndex = {};
		this._currentPage = null;
		
		this._handleServerEvents();
		this._handleUserEvents();
		
		this._setupTemplate(parent);
		this._tabContainer = new TabContainer(this._template.nodes.main, "page");
		this._setupRouter();
		
		setInterval(this._updateClocks.bind(this), 100);
	}
	
	Play.prototype._handleServerEvents = function() {
		this._server.ConnectionOpened.addHandler(function() {
			this._user.getDetails().then((function() {
				this._initialise();
				this._router.loadFromUrl();
			}).bind(this));
		}, this);
		
		this._server.ConnectionLost.addHandler(function() {
			this._template.set("serverConnected", false);
		}, this);
	}
	
	Play.prototype._initialise = function() {
		this._clearPages();
		this._gamePages = [];
		this._template.set("gamePages", []);
		this._addGamePages();
		this._updateUserDependentElements();
		
		this._template.set({
			message: null,
			dialog: null,
			serverConnected: true,
			waitingForServer: false,
			showControlPanel: false
		});
	}
	
	Play.prototype._addGamePage = function(game) {
		var id = game.getId();
		var url = "/game/" + id;
		
		if(!this._hasPage(url)) {
			var page = new GamePage(game, this._user, this._server, this._tabContainer.createTab(url));
			
			this._pages[url] = page;
			this._gamePages.push(page);
			this._gamePageIndex[id] = this._gamePages.length - 1;
			
			this._updateGamePage(page);
			
			page.Rematch.addHandler(function(game) {
				var newId = game.getId();
				var newUrl = "/game/" + newId;
				
				this._tabContainer.changeId(url, newUrl);
				this._changePageUrl(url, newUrl);
				this._gamePageIndex[newId] = this._gamePageIndex[id];
				
				if(this._router.getCurrentPath() === url) {
					this._router.navigate(newUrl);
				}
				
				this._updateGamePage(page);
				
				url = newUrl;
				id = newId;
			}, this);
		}
	}
	
	Play.prototype._updateGamePage = function(page) {
		var id = page.getId();
		
		var data = {
			url: "/game/" + id,
			userIsPlaying: page.userIsPlaying(),
			white: page.getPlayerName(Colour.white),
			black: page.getPlayerName(Colour.black),
			timingStyle: page.getTimingStyle().getDescription(),
			isInProgress: page.gameIsInProgress()
		};
		
		if(page.userIsPlaying()) {
			var colour = page.getUserColour();
			
			data.opponent = page.getPlayerName(colour.opposite);
			data.playerTime = page.getTimeLeft(colour);
		}
		
		this._template.set("gamePages." + this._gamePageIndex[id], data);
	}
	
	Play.prototype._updateGamePages = function() {
		this._gamePages.forEach((function(page) {
			this._updateGamePage(page);
		}).bind(this));
	}
	
	Play.prototype._clearGamePages = function() {
		this._template.set("gamePages", []);
	}
	
	Play.prototype._updateClocks = function() {
		this._gamePages.forEach((function(page) {
			if(page.userIsPlaying() && page.gameIsInProgress() && page !== this._currentPage) {
				this._template.set(
					"gamePages." + this._gamePageIndex[page.getId()] + ".playerTime",
					page.getTimeLeft(page.getUserColour())
				);
			}
		}).bind(this));
	}
	
	Play.prototype._addGamePages = function() {
		this._user.getGames().then((function(games) {
			games.forEach((function(game) {
				this._addGamePage(game);
			}).bind(this));
		}).bind(this));
	}
	
	Play.prototype._clearPages = function() {
		this._tabContainer.clear();
		
		var page;
		
		for(var url in this._pages) {
			page = this._pages[url];
			
			if(page.remove) {
				page.remove();
			}
		}
		
		this._pages = {};
	}
	
	Play.prototype._showPage = function(url) {
		var page = this._pages[url];
		
		if(this._currentPage !== page) {
			if(this._currentPage !== null && this._currentPage.hide) {
				this._currentPage.hide();
			}
			
			if(page.show) {
				page.show();
			}
		}
		
		this._currentPage = page;
		this._tabContainer.showTab(url);
	}
	
	Play.prototype._hasPage = function(url) {
		return (url in this._pages);
	}
	
	Play.prototype._changePageUrl = function(oldUrl, newUrl) {
		this._pages[newUrl] = this._pages[oldUrl];
		
		delete this._pages[oldUrl];
	}
	
	Play.prototype._setupRouter = function() {
		this._router = new Router();
		
		this._template.set("currentPath", this._router.getCurrentPath());
		
		this._router.UrlChanged.addHandler(function(path) {
			this._template.set("currentPath", path);
		}, this);
		
		this._router.addRoute("/", (function(params, url) {
			if(!this._hasPage(url)) {
				this._pages[url] = new HomePage(this._user, this._server, this._router, this._tabContainer.createTab(url));
			}
			
			this._showPage(url);
		}).bind(this));
		
		this._router.addRoute("/game/:id", (function(params, url) {
			if(this._hasPage(url)) {
				this._showPage(url);
			}
			
			else {
				this._template.set("loadingGame", true);
				this._template.set("loadingGameId", params.id);
				
				this._user.getGame(params.id).then((function(game) {
					if(!this._hasPage(url)) {
						this._addGamePage(game);
					}
					
					this._showPage(url);
				}).bind(this), (function() {
					this._showMessage(
						"The requested game could not be found &ndash; if you had a game in"
						+ " progress, you may be able to restore it by clicking \"Restore game\"",
						5
					);
					
					this._router.navigate("/");
				}).bind(this), (function() {
					this._template.set("loadingGame", false);
				}).bind(this));
			}
		}).bind(this));
	}
	
	Play.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				message: null,
				dialog: null,
				serverConnected: false,
				waitingForServer: true,
				showControlPanel: false,
				username: this._user.getUsername(),
				userIsLoggedIn: false,
				gamePages: [],
				currentPath: "/",
				getAbsolutePath: function(path) {
					return require.toUrl(path);
				}
			},
			partials: {
				nav: navHtml
			}
		});
		
		this._template.on("navigate", (function(event) {
			if(event.original.button !== MouseButtons.middle) {
				event.original.preventDefault();
			
				this._router.navigate(event.node.getAttribute("href"));
			}
		}).bind(this));
		
		var lastClickTarget = null;
		
		this._template.on("hide_popups", (function() {
			this._hideMessage();
			
			if(lastClickTarget !== "controlPanel") {
				this._template.set("showControlPanel", false);
			}
			
			lastClickTarget = null;
		}).bind(this));
		
		this._template.on("hide_dialog", (function() {
			if(lastClickTarget !== "dialog") {
				this._template.set("showControlPanel", false);
			}
			
			lastClickTarget = null;
		}).bind(this));
		
		this._template.on("register_click", (function(event, target) {
			lastClickTarget = target;
		}).bind(this));
		
		this._template.on("dialog_click", (function(event, target) {
			lastClickTarget = "dialog";
		}).bind(this));
		
		this._template.on("toggle_control_panel", (function() {
			this._template.set("showControlPanel", !this._template.get("showControlPanel"));
			
			lastClickTarget = "controlPanel";
		}).bind(this));
		
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
		
		setTimeout((function() {
			this._template.set("waitingForServer", false);
		}).bind(this), 3000);
	}
	
	Play.prototype._showMessage = function(message, durationInSeconds) {
		this._hideMessage();
		this._template.set("message", message);
		
		if(durationInSeconds) {
			this._hideMessageTimer = setTimeout((function() {
				this._hideMessage();
			}).bind(this), durationInSeconds * 1000);
		}
	}
	
	Play.prototype._hideMessage = function() {
		this._template.set("message", null);
		
		if(this._hideMessageTimer !== null) {
			clearTimeout(this._hideMessageTimer);
			
			this._hideMessageTimer = null;
		}
	}
	
	Play.prototype._handleUserEvents = function() {
		this._user.SeekMatched.addHandler(function(game) {
			this._router.navigate("/game/" + game.getId());
		}, this);
		
		this._user.GameRestored.addHandler(function(game) {
			this._router.navigate("/game/" + game.getId());
		}, this);
		
		this._user.LoggedIn.addHandler(function() {
			this._addGamePages();
			this._updateUserDependentElements();
		}, this);
		
		this._user.LoggedOut.addHandler(function() {
			this._initialise();
			this._router.loadFromUrl();
		}, this);
	}
	
	Play.prototype._updateUserDependentElements = function() {
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
		this._template.set("username", this._user.getUsername());
		this._updateGamePages();
	}
	
	return Play;
});
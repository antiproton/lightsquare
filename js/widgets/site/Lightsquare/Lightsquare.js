define(function(require) {
	require("lib/Array.empty");
	require("css!./lightsquare.css");
	require("css!./forms.css");
	require("css!./header.css");
	require("css!./control_panel.css");
	var html = require("file!./lightsquare.html");
	var headerHtml = require("file!./header.html");
	var controlPanelHtml = require("file!./control_panel.html");
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
	
	function Lightsquare(server, challengeList, user, parent) {
		this._server = server;
		this._challengeList = challengeList;
		this._user = user;
		
		this._pages = {};
		this._gamePages = [];
		this._currentPage = null;
		
		this._handleServerEvents();
		this._handleUserEvents();
		
		this._setupTemplate(parent);
		this._tabContainer = new TabContainer(this._template.nodes.main, "page");
		this._setupRouter();
	}
	
	Lightsquare.prototype._handleServerEvents = function() {
		this._server.ConnectionOpened.addHandler(this, function() {
			this._user.getDetails().then((function() {
				this._initialise();
				this._router.loadFromUrl();
			}).bind(this));
		});
		
		this._server.ConnectionLost.addHandler(this, function() {
			this._template.set("serverConnected", false);
		});
	}
	
	Lightsquare.prototype._initialise = function() {
		this._clearPages();
		this._gamePages.empty();
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
	
	Lightsquare.prototype._addGamePage = function(game) {
		var url = "/game/" + game.getId();
		
		if(!this._hasPage(url)) {
			var page = new GamePage(game, this._user, this._tabContainer.createTab(url));
			
			this._pages[url] = page;
			this._gamePages.push(page);
			
			page.PlayerClockTick.addHandler(this, function() {
				this._updateGamePage(page);
			});
			
			page.Rematch.addHandler(this, function(game) {
				var newUrl = "/game/" + game.getId();
				
				this._tabContainer.changeId(url, newUrl);
				this._router.navigate(newUrl);
				this._updateGamePage(page);
				
				url = newUrl;
			});
		}
	}
	
	Lightsquare.prototype._updateGamePage = function(page) {
		this._template.update("gamePages." + this._gamePages.indexOf(page));
	}
	
	Lightsquare.prototype._addGamePages = function() {
		this._user.getGames().then((function(games) {
			games.forEach((function(game) {
				this._addGamePage(game);
			}).bind(this));
		}).bind(this));
	}
	
	Lightsquare.prototype._clearPages = function() {
		this._tabContainer.clear();
		
		for(var url in this._pages) {
			this._pages[url].remove();
		}
		
		this._pages = {};
	}
	
	Lightsquare.prototype._showPage = function(url) {
		var page = this._pages[url];
		
		if(this._currentPage !== page) {
			if(this._currentPage !== null) {
				this._currentPage.hide();
			}
			
			page.show();
		}
		
		this._currentPage = page;
		this._tabContainer.showTab(url);
	}
	
	Lightsquare.prototype._hasPage = function(url) {
		return (url in this._pages);
	}
	
	Lightsquare.prototype._setupRouter = function() {
		this._router = new Router();
		
		this._template.set("currentPath", this._router.getCurrentPath());
		
		this._router.UrlChanged.addHandler(this, function(path) {
			this._template.set("currentPath", path);
		});
		
		this._router.addRoute("/", (function(params, url) {
			if(!this._hasPage(url)) {
				this._pages[url] = new HomePage(this._challengeList, this._user, this._tabContainer.createTab(url));
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
	
	Lightsquare.prototype._setupTemplate = function(parent) {
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
				gamePages: this._gamePages,
				currentPath: "/",
				getGameTitle: function(gamePage, currentPath) {
					var timingStyle = gamePage.getTimingStyle().getDescription();
					var playerColour = gamePage.getPlayerColour();
					var whiteName = gamePage.getPlayerName(Colour.white);
					var blackName = gamePage.getPlayerName(Colour.black);
					
					if(playerColour === null) {
						return whiteName + " vs " + blackName + " | " + timingStyle;
					}
					
					else {
						var opponentName = gamePage.getPlayerName(playerColour.opposite);
						var timeLeft = gamePage.getTimeLeft(playerColour);
						var title = opponentName + " | " + timingStyle;
						
						if(gamePage.gameIsInProgress() && currentPath !== "/game/" + gamePage.getId()) {
							title += " | " + timeLeft.getColonDisplay();
						}
						
						return title;
					}
				},
				getAbsolutePath: function(path) {
					return require.toUrl(path);
				}
			},
			partials: {
				header: headerHtml,
				controlPanel: controlPanelHtml
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
	
	Lightsquare.prototype._showMessage = function(message, durationInSeconds) {
		this._hideMessage();
		this._template.set("message", message);
		
		if(durationInSeconds) {
			this._hideMessageTimer = setTimeout((function() {
				this._hideMessage();
			}).bind(this), durationInSeconds * 1000);
		}
	}
	
	Lightsquare.prototype._hideMessage = function() {
		this._template.set("message", null);
		
		if(this._hideMessageTimer !== null) {
			clearTimeout(this._hideMessageTimer);
			
			this._hideMessageTimer = null;
		}
	}
	
	Lightsquare.prototype._handleUserEvents = function() {
		this._user.NewGame.addHandler(this, function(game) {
			this._router.navigate("/game/" + game.getId());
		});
		
		this._user.LoggedIn.addHandler(this, function() {
			this._addGamePages();
			this._updateUserDependentElements();
		});
		
		this._user.LoggedOut.addHandler(this, function() {
			this._initialise();
			this._router.loadFromUrl();
		});
	}
	
	Lightsquare.prototype._updateUserDependentElements = function() {
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
		this._template.set("username", this._user.getUsername());
		this._template.update("gamePages");
	}
	
	return Lightsquare;
});
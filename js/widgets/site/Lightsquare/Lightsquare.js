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
	var Pages = require("lib/Pages");
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
		
		this._gamePages = [];
		this._handleServerEvents();
		this._handleUserEvents();
		
		this._setupTemplate(parent);
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
		this._pages.clear();
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
		
		if(!this._pages.hasPage(url)) {
			var page = this._pages.createPage(url);
			var gamePage = new GamePage(game, this._user, page);
			
			this._gamePages.push(gamePage);
			
			gamePage.PlayerClockTick.addHandler(this, function() {
				this._updateGamePage(gamePage);
			});
			
			gamePage.Rematch.addHandler(this, function(game) {
				var newUrl = "/game/" + game.getId();
				
				this._pages.changeId(url, newUrl);
				this._router.navigate(newUrl);
				this._updateGamePage(gamePage);
				
				url = newUrl;
			});
		}
	}
	
	Lightsquare.prototype._updateGamePage = function(gamePage) {
		this._template.update("gamePages." + this._gamePages.indexOf(gamePage));
	}
	
	Lightsquare.prototype._addGamePages = function() {
		this._user.getGames().then((function(games) {
			games.forEach((function(game) {
				this._addGamePage(game);
			}).bind(this));
		}).bind(this));
	}
	
	Lightsquare.prototype._setupRouter = function() {
		this._router = new Router();
		
		this._template.set("currentPath", this._router.getCurrentPath());
		
		this._router.UrlChanged.addHandler(this, function(path) {
			this._template.set("currentPath", path);
		});
		
		this._router.addRoute("/", (function(params, url) {
			if(!this._pages.hasPage(url)) {
				var page = this._pages.createPage(url);
				
				new HomePage(this._challengeList, this._user, page);
			}
			
			this._pages.showPage(url);
			this._challengeList.startUpdating();
		}).bind(this));
		
		this._router.addRoute("/game/:id", (function(params, url) {
			if(this._pages.hasPage(url)) {
				this._pages.showPage(url);
				this._challengeList.stopUpdating();
			}
			
			else {
				this._template.set("loadingGame", true);
				this._template.set("loadingGameId", params.id);
				
				this._user.getGame(params.id).then((function(game) {
					if(!this._pages.hasPage(url)) {
						this._addGamePage(game);
					}
					
					this._pages.showPage(url);
					this._challengeList.stopUpdating();
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
		
		this._pages = new Pages(this._template.nodes.main);
		
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
			this._gamePages.empty();
			this._router.navigate("/");
			this._updateUserDependentElements();
		});
	}
	
	Lightsquare.prototype._updateUserDependentElements = function() {
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
		this._template.set("username", this._user.getUsername());
		this._template.update("gamePages");
	}
	
	return Lightsquare;
});
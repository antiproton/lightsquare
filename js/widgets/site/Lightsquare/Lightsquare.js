define(function(require) {
	require("lib/Array.empty");
	require("css!./lightsquare.css");
	require("css!./header.css");
	require("css!./control_panel.css");
	require("css!./messages/logout_confirmation.css");
	require("css!./messages/server_disconnect.css");
	require("css!./messages/game_not_found.css");
	var html = require("file!./lightsquare.html");
	var headerHtml = require("file!./header.html");
	var controlPanelHtml = require("file!./control_panel.html");
	var logoutConfirmationHtml = require("file!./messages/logout_confirmation.html");
	var serverDisconnectHtml = require("file!./messages/server_disconnect.html");
	var gameNotFoundHtml = require("file!./messages/game_not_found.html");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var Pages = require("lib/Pages");
	var LoadingPage = require("./_LoadingPage/LoadingPage");
	var HomePage = require("./_HomePage/HomePage");
	var GamePage = require("./_GamePage/GamePage");
	var Colour = require("chess/Colour");
	
	var MouseButtons = {
		left: 0,
		middle: 1
	};
	
	function Lightsquare(server, app, user, parent) {
		this._server = server;
		this._app = app;
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
			this._displayServerDisconnectMessage();
		});
	}
	
	Lightsquare.prototype._initialise = function() {
		this._pages.clear();
		this._gamePages.empty();
		this._hideMessage();
		this._addGamePages();
		this._updateUserDependentElements();
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
				
				new HomePage(this._app, this._user, page);
			}
			
			this._pages.showPage(url);
			this._app.startUpdatingChallengeList();
		}).bind(this));
		
		this._router.addRoute("/game/:id", (function(params, url) {
			if(this._pages.hasPage(url)) {
				this._pages.showPage(url);
				this._app.stopUpdatingChallengeList();
			}
			
			else {
				this._template.set("loadingGame", true);
				this._template.set("loadingGameId", params.id);
				
				this._user.getGame(params.id).then((function(game) {
					if(!this._pages.hasPage(url)) {
						this._addGamePage(game);
					}
					
					this._pages.showPage(url);
					this._app.stopUpdatingChallengeList();
				}).bind(this), (function() {
					this._displayGameNotFoundMessage();
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
				showPopups: {
					controlPanel: false,
					message: false
				},
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
		
		var lastPopupClicked = null;
		
		this._template.on("hide_popups", (function() {
			var showPopups = this._template.get("showPopups");
			
			for(var popup in showPopups) {
				if(lastPopupClicked !== popup) {
					this._template.set("showPopups." + popup, false);
				}
			}
			
			lastPopupClicked = null;
		}).bind(this));
		
		this._template.on("click_popup", (function(event, popup) {
			lastPopupClicked = popup;
		}).bind(this));
		
		this._template.on("toggle_control_panel", (function() {
			this._template.set("showPopups.controlPanel", !this._template.get("showPopups.controlPanel"));
			
			lastPopupClicked = "controlPanel";
		}).bind(this));
		
		this._template.on("logout", (function() {
			if(this._user.hasGamesInProgress()) {
				this._displayLogoutConfirmation();
			}
			
			else {
				this._user.logout();
			}
		}).bind(this));
		
		this._pages = new Pages(this._template.nodes.main);
		
		new LoadingPage(this._pages.createPage("/loading"), 3);
		
		this._pages.showPage("/loading");
	}
	
	Lightsquare.prototype._displayLogoutConfirmation = function() {
		this._showMessage(5);
		
		this._logoutConfirmation = new Ractive({
			el: this._template.nodes.message,
			template: logoutConfirmationHtml
		});
		
		this._logoutConfirmation.on("logout", (function() {
			this._user.logout();
			this._hideMessage();
		}).bind(this));
		
		this._logoutConfirmation.on("cancel", (function() {
			this._hideMessage();
		}).bind(this));
	}
	
	Lightsquare.prototype._displayServerDisconnectMessage = function() {
		this._showMessage();
		
		new Ractive({
			el: this._template.nodes.message,
			template: serverDisconnectHtml
		});
	}
	
	Lightsquare.prototype._displayGameNotFoundMessage = function() {
		this._showMessage(5);
		
		new Ractive({
			el: this._template.nodes.message,
			template: gameNotFoundHtml
		});
	}
	
	Lightsquare.prototype._showMessage = function(durationInSeconds) {
		this._hideMessageTimer = null;
		this._template.set("showPopups.message", true);
		this._template.nodes.message.innerHTML = "";
		
		if(durationInSeconds) {
			this._hideMessageTimer = setTimeout((function() {
				this._hideMessage();
			}).bind(this), durationInSeconds * 1000);
		}
	}
	
	Lightsquare.prototype._hideMessage = function() {
		this._template.set("showPopups.message", false);
		
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
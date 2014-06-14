define(function(require) {
	require("css!./lightsquare.css");
	require("css!./header.css");
	require("css!./logoutConfirmation.css");
	require("css!./serverDisconnectMessage.css");
	var html = require("file!./lightsquare.html");
	var headerHtml = require("file!./header.html");
	var logoutConfirmationHtml = require("file!./logoutConfirmation.html");
	var serverDisconnectMessageHtml = require("file!./serverDisconnectMessage.html");
	var Template = require("lib/dom/Template");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var Pages = require("./_Pages");
	var HomePage = require("./_HomePage/HomePage");
	var GamePage = require("./_GamePage/GamePage");
	var ProfilePage = require("./_ProfilePage/ProfilePage");
	var Colour = require("chess/Colour");
	
	var MouseButtons = {
		left: 0,
		middle: 1
	};
	
	function Lightsquare(app, user, parent) {
		this._app = app;
		this._user = user;
		
		this._app.ServerDisconnected.addHandler(this, function() {
			this._displayServerDisconnectMessage();
		});
		
		this._setupRouter();
		this._setupTemplate(parent);
		this._handleUserEvents();
		
		this._router.loadFromUrl();
	}
	
	Lightsquare.prototype._addGamePage = function(game) {
		var url = "/game/" + game.getId();
		var page = this._pages.createPage(url);
		var gamePage = new GamePage(game, this._user, page);
		
		this._template.get("gamePages").push(gamePage);
		
		gamePage.PlayerClockTick.addHandler(this, function() {
			this._updateHeaderGamePage(gamePage);
		});
		
		gamePage.Rematch.addHandler(this, function(game) {
			var newUrl = "/game/" + game.getId();
			
			this._pages.changeUrl(url, newUrl);
			this._router.navigate(newUrl);
			this._updateHeaderGamePage(gamePage);
			
			url = newUrl;
		});
	}
	
	Lightsquare.prototype._updateHeaderGamePage = function(gamePage) {
		this._template.update("gamePages." + this._template.get("gamePages").indexOf(gamePage));
	}
	
	Lightsquare.prototype._setupRouter = function() {
		this._router = new Router();
		
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
			this._user.getGame(params.id).then((function(game) {
				if(!this._pages.hasPage(url)) {
					this._addGamePage(game);
				}
				
				this._pages.showPage(url);
				this._app.stopUpdatingChallengeList();
			}).bind(this), (function() {
				//display game not found message
			}).bind(this));
		}).bind(this));
		
		this._router.addRoute("/user/profile", (function(params, url) {
			if(!this._pages.hasPage(url)) {
				var page = this._pages.createPage(url);
				
				new ProfilePage(this._user, page);
			}
			
			this._pages.showPage(url);
			this._app.stopUpdatingChallengeList();
		}).bind(this));
	}
	
	Lightsquare.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				showMessage: false,
				username: this._user.getUsername(),
				userIsLoggedIn: false,
				gamePages: [],
				currentPath: this._router.getCurrentPath(),
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
						
						if(currentPath !== "/game/" + gamePage.getId()) {
							title += " | " + timeLeft.getColonDisplay();
						}
						
						return title;
					}
				}
			},
			partials: {
				header: headerHtml
			}
		});
		
		this._template.on("navigate", (function(event) {
			if(event.original.button !== MouseButtons.middle) {
				event.original.preventDefault();
			
				this._router.navigate(event.node.getAttribute("href"));
			}
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
	}
	
	Lightsquare.prototype._displayLogoutConfirmation = function() {
		this._template.message.innerHTML = "";
		
		this._logoutConfirmation = new Ractive({
			el: this._template.message,
			template: logoutConfirmationHtml
		});
		
		this._logoutConfirmation.on("logout", (function() {
			this._user.logout();
			this._hideMessage();
		}).bind(this));
		
		this._logoutConfirmation.on("cancel", (function() {
			this._hideMessage();
		}).bind(this));
		
		this._showMessage(5);
	}
	
	Lightsquare.prototype._displayServerDisconnectMessage = function() {
		this._template.message.innerHTML = "";
		
		new Ractive({
			el: this._template.message,
			template: serverDisconnectMessageHtml
		});
		
		this._showMessage();
	}
	
	Lightsquare.prototype._showMessage = function(durationInSeconds) {
		this._hideMessageTimer = null;
		this._template.set("showMessage", true);
		
		if(durationInSeconds) {
			this._hideMessageTimer = setTimeout((function() {
				this._hideMessage();
			}).bind(this), durationInSeconds * 1000);
		}
	}
	
	Lightsquare.prototype._hideMessage = function() {
		this._template.set("showMessage", false);
		
		if(this._hideMessageTimer !== null) {
			clearTimeout(this._hideMessageTimer);
			
			this._hideMessageTimer = null;
		}
	}
	
	Lightsquare.prototype._handleUserEvents = function() {
		this._user.DetailsChanged.addHandler(this, function() {
			this._template.set("username", this._user.getUsername());
		});
		
		this._user.NewGame.addHandler(this, function(id) {
			this._router.navigate("/game/" + id);
		});
		
		this._user.LoggedIn.addHandler(this, function() {
			this._updateLoginDependentUiElements();
		});
		
		this._user.LoggedOut.addHandler(this, function() {
			this._updateLoginDependentUiElements();
		});
		
		this._user.HasIdentity.addHandler(this, function() {
			this._updateLoginDependentUiElements();
		});
	}
	
	Lightsquare.prototype._updateLoginDependentUiElements = function() {
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
	}
	
	return Lightsquare;
});
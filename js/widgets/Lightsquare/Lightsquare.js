define(function(require) {
	require("css!./lightsquare.css");
	require("css!./header.css");
	var html = require("file!./lightsquare.html");
	var headerHtml = require("file!./header.html");
	var Template = require("lib/dom/Template");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var Pages = require("./_Pages");
	var HomePage = require("./_HomePage/HomePage");
	var GamePage = require("./_GamePage/GamePage");
	var ProfilePage = require("./_ProfilePage/ProfilePage");
	var WelcomePage = require("./_WelcomePage/WelcomePage");
	var Colour = require("chess/Colour");
	
	var MouseButtons = {
		left: 0,
		middle: 1
	};
	
	function Lightsquare(app, user, parent) {
		this._app = app;
		this._user = user;
		this._gamePages = {};
		
		this._template = new Template(html, parent);
		this._pages = new Pages(this._template.main);
		
		this._setupRouter();
		this._setupHeader();
		
		this._handleUserEvents();
		
		this._router.loadPath();
	}
	
	Lightsquare.prototype._addGamePage = function(game) {
		var id = game.getId();
		var url = "/game/" + id;
		
		if(!this._pages.hasPage(url)) {
			var page = this._pages.createPage(url);
			var gamePage = new GamePage(game, this._user, page);
			
			this._header.get("gamePages").push(gamePage);
			
			gamePage.PlayerClockTick.addHandler(this, function() {
				var index = this._header.get("gamePages").indexOf(gamePage);
				
				this._header.update("gamePages." + index);
			});
		}
	}
	
	Lightsquare.prototype._setupRouter = function() {
		this._router = new Router();
		
		this._router.PathChanged.addHandler(this, function(data) {
			this._header.set("currentPath", data.path);
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
			}
			
			else {
				this._user.spectateGame(params["id"]);
			}
			
			this._app.stopUpdatingChallengeList();
		}).bind(this));
		
		this._router.addRoute("/user/profile", (function(params, url) {
			if(!this._pages.hasPage(url)) {
				var page = this._pages.createPage(url);
				
				new ProfilePage(this._user, page);
			}
			
			this._pages.showPage(url);
			this._app.stopUpdatingChallengeList();
		}).bind(this));
		
		this._router.addRoute("/user/welcome", (function(params, url) {
			if(!this._pages.hasPage(url)) {
				var page = this._pages.createPage(url);
				
				new WelcomePage(this._user, page);
			}
			
			this._pages.showPage(url);
			this._app.stopUpdatingChallengeList();
		}).bind(this));
	}
	
	Lightsquare.prototype._setupHeader = function() {
		this._header = new Ractive({
			template: headerHtml,
			el: this._template.header,
			data: {
				username: this._user.getUsername(),
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
			}
		});
		
		this._header.on("navigate", (function(event, href) {
			if(event.original.button !== MouseButtons.middle) {
				event.original.preventDefault();
			
				this._router.loadPath(href);
			}
		}).bind(this));
	}
	
	Lightsquare.prototype._handleUserEvents = function() {
		this._user.DetailsChanged.addHandler(this, function() {
			this._header.set("username", this._user.getUsername());
		});
		
		this._user.Registered.addHandler(this, function() {
			this._router.loadPath("/user/welcome");
		});
		
		this._user.GamesReceived.addHandler(this, function(data) {
			data.games.forEach((function(game) {
				this._addGamePage(game);
			}).bind(this));
			
			this._router.loadPath();
		});
		
		this._user.NeededInGame.addHandler(this, function(data) {
			this._router.loadPath("/game/" + data.id);
		});
	}
	
	return Lightsquare;
});
define(function(require) {
	require("css!./resources/lightsquare.css");
	var html = require("file!./resources/lightsquare.html");
	var linksHtml = require("file!./resources/links.html");
	var userLinkHtml = require("file!./resources/user_link.html");
	var Template = require("lib/dom/Template");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var Pages = require("./_Pages");
	var HomePage = require("./_HomePage/HomePage");
	var GamePage = require("./_GamePage/GamePage");
	var ProfilePage = require("./_ProfilePage/ProfilePage");
	var WelcomePage = require("./_WelcomePage/WelcomePage");
	
	function Lightsquare(app, user, parent) {
		this._app = app;
		this._user = user;
		this._template = new Template(html, parent);
		this._pages = new Pages(this._template.main);
		this._setupRouter();
		this._setupNavLinks();
		this._setupUserLink();
		this._listenForNewGames();
		this._router.loadPath();
		this._openCurrentGames();
		this._handleUserEvents();
	}
	
	Lightsquare.prototype._openCurrentGames = function() {
		this._user.getGames().forEach((function(game) {
			this._router.loadPath("/game/" + game.getId());
		}).bind(this));
	}
	
	Lightsquare.prototype._listenForNewGames = function() {
		this._user.GamesReceived.addHandler(this, function(data) {
			data.games.forEach((function(game) {
				this._addGameLink(game);
			}).bind(this));
		});
		
		this._user.GameReady.addHandler(this, function(data) {
			this._addGameLink(data.game);
			this._goToGame(data.game);
		});
	}
	
	Lightsquare.prototype._addGameLink = function(game) {
		var href = "/game/" + game.getId();
		
		this._links.get("links").push({
			href: href,
			label: game.getId()
		});
	}
	
	Lightsquare.prototype._goToGame = function(game) {
		this._router.loadPath("/game/" + game.getId());
	}
	
	Lightsquare.prototype._setupRouter = function() {
		this._router = new Router();
		
		this._router.PathChanged.addHandler(this, function() {
			this._links.set("currentPath", window.location.pathname);
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
				var id = params["id"];
				
				if(this._user.hasGame(id)) {
					var page = this._pages.createPage(url);
					
					new GamePage(this._user.getGame(id), this._user, page);
					
					this._pages.showPage(url);
				}
				
				else {
					this._user.spectateGame(id);
				}
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
	
	Lightsquare.prototype._setupNavLinks = function() {
		this._links = new Ractive({
			template: linksHtml,
			el: this._template.nav,
			data: {
				links: [
					{
						href: "/",
						label: "Home"
					}
				],
				currentPath: window.location.pathname
			}
		});
		
		this._links.on("click", (function(event) {
			event.original.preventDefault();
			
			this._router.loadPath(event.context.href);
		}).bind(this));
	}
	
	Lightsquare.prototype._setupUserLink = function() {
		this._userLink = new Ractive({
			el: this._template.user,
			template: userLinkHtml,
			data: {
				username: this._user.getUsername()
			}
		});
		
		this._userLink.on("click", (function(event) {
			event.original.preventDefault();
			
			this._router.loadPath("/user/profile");
		}).bind(this));
	}
	
	Lightsquare.prototype._handleUserEvents = function() {
		this._user.Replaced.addHandler(this, function() {
			window.location.replace("/");
		});
		
		this._user.DetailsChanged.addHandler(this, function() {
			this._userLink.set("username", this._user.getUsername());
		});
		
		this._user.Registered.addHandler(this, function() {
			this._router.loadPath("/user/welcome");
		});
	}
	
	return Lightsquare;
});
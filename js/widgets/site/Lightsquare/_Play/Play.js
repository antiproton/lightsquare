define(function(require) {
	require("Array.prototype/empty");
	require("css!./play.css");
	var html = require("file!./play.html");
	var navHtml = require("file!./nav.html");
	var connectingMessageHtml = require("file!./connecting_message.html");
	var Ractive = require("ractive/Ractive");
	var TabContainer = require("dom/TabContainer");
	var Colour = require("chess/Colour");
	var HomePage = require("./_HomePage/HomePage");
	var GamePage = require("./_GamePage/GamePage");
	
	var LEFT_BUTTON = 0;
	
	function Play(user, server, router, parent) {
		this._user = user;
		this._server = server;
		this._router = router;
		
		this._pages = {};
		this._gamePages = [];
		this._gamePageIndex = {};
		this._currentPage = null;
		
		this._handleServerEvents();
		this._handleUserEvents();
		
		this._setupTemplate(parent);
		this._tabContainer = new TabContainer(this._template.nodes.main, "play_page");
		this._setupRouter();
		
		setInterval(this._updateClocks.bind(this), 100);
	}
	
	Play.prototype._handleServerEvents = function() {
		this._server.Connected.addHandler(function() {
			this._user.getDetails().then((function() {
				this._initialise();
				this._router.execute();
			}).bind(this));
		}, this);
		
		this._server.Disconnected.addHandler(function() {
			this._template.set("serverConnected", false);
		}, this);
	}
	
	Play.prototype._initialise = function() {
		this._tabContainer.clear();
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
			var page = new GamePage(game, this._user, this._server, this._router.createChild(url), this._createPage(url));
			
			this._pages[url] = page;
			this._gamePages.push(page);
			this._gamePageIndex[id] = this._gamePages.length - 1;
			
			this._updateGamePage(page);
			
			page.Rematch.addHandler(function(game) {
				var newId = game.getId();
				var newUrl = "/game/" + newId;
				
				this._tabContainer.changeId(url, newUrl);
				this._gamePageIndex[newId] = this._gamePageIndex[id];
				
				if(this._router.getPath() === url) {
					this._router.setPath(newUrl);
				}
				
				this._updateGamePage(page);
				
				url = newUrl;
				id = newId;
			}, this);
			
			page.Move.addHandler(function() {
				this._updateGamePage(page);
			}, this);
			
			page.GameOver.addHandler(function() {
				this._updateGamePage(page);
			}, this);
			
			page.Aborted.addHandler(function() {
				this._updateGamePage(page);
			}, this);
		}
	}
	
	Play.prototype._updateGamePage = function(page) {
		var id = page.getId();
		
		var data = {
			href: "/game/" + id,
			userIsPlaying: page.userIsPlaying(),
			userIsActivePlayer: page.userIsActivePlayer(),
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
	
	Play.prototype._hasPage = function(url) {
		return this._tabContainer.hasTab(url);
	}
	
	Play.prototype._showPage = function(url) {
		this._tabContainer.showTab(url);
	}
	
	Play.prototype._createPage = function(url) {
		return this._tabContainer.createTab(url);
	}
	
	Play.prototype._setupRouter = function() {
		this._router.PathChanged.addHandler(function(path) {
			this._template.set("currentPath", path);
		}, this);
		
		this._router.addRoute("/", (function(params, url) {
			if(!this._hasPage(url)) {
				new HomePage(this._user, this._server, this._router.createChild(), this._createPage(url));
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
					//FIXME do something here
					//this._showMessage(
					//	"The requested game could not be found &ndash; if you had a game in"
					//	+ " progress, you may be able to restore it by clicking \"Restore game\"",
					//	5
					//);
					
					this._router.setPath("/");
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
				timeCriticalThreshold: 1000 * 10,
				serverConnected: false,
				waitingForServer: true,
				gamePages: [],
				currentPath: this._router.getPath(),
				navLinks: [
					{
						href: "/",
						label: "New game",
						className: "new_game"
					}
				],
				getHref: (function(path) {
					return this._router.getAbsolutePath(path);
				}).bind(this),
				getAbsolutePath: function(path) {
					return require.toUrl(path);
				}
			},
			partials: {
				nav: navHtml,
				connectingMessage: connectingMessageHtml
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
		
		setTimeout((function() {
			this._template.set("waitingForServer", false);
		}).bind(this), 3000);
	}
	
	Play.prototype._handleUserEvents = function() {
		this._user.SeekMatched.addHandler(function(game) {
			this._router.setPath("/game/" + game.getId());
		}, this);
		
		this._user.GameRestored.addHandler(function(game) {
			this._router.setPath("/game/" + game.getId());
		}, this);
		
		this._user.LoggedIn.addHandler(function() {
			this._addGamePages();
			this._updateUserDependentElements();
		}, this);
		
		this._user.LoggedOut.addHandler(function() {
			this._initialise();
			this._router.execute();
		}, this);
	}
	
	Play.prototype._updateUserDependentElements = function() {
		this._template.set("userIsLoggedIn", this._user.isLoggedIn());
		this._template.set("username", this._user.getUsername());
		this._updateGamePages();
	}
	
	return Play;
});
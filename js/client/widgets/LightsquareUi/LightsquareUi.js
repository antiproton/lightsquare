define(function(require) {
	require("css!./resources/lightsquare_ui.css");
	var html = require("file!./resources/lightsquare_ui.html");
	var linksHtml = require("file!./resources/links.html");
	var Template = require("lib/dom/Template");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	var PageCache = require("./_PageCache");
	
	function LightSquareUi(app, parent) {
		var template = new Template(html, parent);
		
		var links = new Ractive({
			template: linksHtml,
			el: template.nav,
			data: {
				links: [
					{
						href: "/",
						label: "Home"
					},
					{
						href: "/play",
						label: "Play"
					}
				],
				currentPath: window.location.pathname
			}
		});
		
		links.on("click", function(event) {
			event.original.preventDefault();
			router.loadPath(event.context.href);
			links.set("currentPath", window.location.pathname);
		});
		
		var pageCache = new PageCache(template.main);
		var router = new Router();
		
		function showPage(url, callback) {
			if(pageCache.hasPage(url)) {
				pageCache.showPage(url);
			}
			
			else {
				callback();
			}
		}
		
		router.addRoute("/", function(params, url) {
			showPage(url, function() {
				require(["./_Home/Home"], function(HomePage) {
					var page = pageCache.createPage(url);
					new HomePage(app, page);
					pageCache.showPage(url);
				});
			});
		});
		
		router.addRoute("/game/:id", function(params, url) {
			showPage(url, function() {
				require(["./_Game/Game"], function(GamePage) {
					var page = pageCache.createPage(url);
					new GamePage(app, parseInt(params["id"]), page);
					pageCache.showPage(url);
				});
			});
		});
		
		router.loadPath();
	}
	
	return LightSquareUi;
});
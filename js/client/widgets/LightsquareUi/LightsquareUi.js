define(function(require) {
	require("css!./resources/lightsquare_ui.css");
	var html = require("file!./resources/lightsquare_ui.html");
	var linksHtml = require("file!./resources/links.html");
	var Template = require("lib/dom/Template");
	var Ractive = require("lib/dom/Ractive");
	var Router = require("lib/Router");
	
	function LightSquareUi(parent, app) {
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
			router.loadPath(event.node.href);
			links.set("currentPath", window.location.pathname);
		});
		
		var router = new Router();
		
		router.addRoute("/", function() {
			require(["./pages/Home/Home"], function(HomePage) {
				template.main.innerHTML = "";
				new HomePage(app, template.main);
			});
		});
		
		router.addRoute("/play", function() {
			require(["./pages/Play/Play"], function(PlayPage) {
				template.main.innerHTML = "";
				new PlayPage(app, template.main);
			});
		});
		
		router.addRoute("/game/:id", function(params) {
			require(["./pages/Game/Game"], function(GamePage) {
				template.main.innerHTML = "";
				new GamePage(app, parseInt(params["id"]), template.main);
			});
		});
		
		router.loadPath();
	}
	
	return LightSquareUi;
});
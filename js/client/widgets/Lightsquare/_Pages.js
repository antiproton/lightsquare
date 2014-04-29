define(function(require) {
	var create = require("lib/dom/create");
	var style = require("lib/dom/style");
	
	function Pages(parent) {
		this._container = create("div", parent);
		this._pages = {};
	}
	
	Pages.prototype.createPage = function(url) {
		if(!this.hasPage(url)) {
			return this._pages[url] = create("div", this._container);
		}
		
		else {
			throw "PageCache - page with url " + url + " already exists";
		}
	}
	
	Pages.prototype.hasPage = function(url) {
		return (url in this._pages);
	}
	
	Pages.prototype.showPage = function(currentUrl) {
		for(var url in this._pages) {
			style(this._pages[url], {
				display: "none"
			});
		}
		
		style(this._pages[currentUrl], {
			display: ""
		});
	}
	
	return Pages;
});
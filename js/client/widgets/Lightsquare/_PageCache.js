define(function(require) {
	var create = require("lib/dom/create");
	var style = require("lib/dom/style");
	
	function PageCache(parent) {
		this._container = create("div", parent);
		this._pages = {};
	}
	
	PageCache.prototype.createPage = function(url) {
		return this._pages[url] = create("div", this._container);
	}
	
	PageCache.prototype.hasPage = function(url) {
		return (url in this._pages);
	}
	
	PageCache.prototype.showPage = function(currentUrl) {
		for(var url in this._pages) {
			style(this._pages[url], {
				display: "none"
			});
		}
		
		style(this._pages[currentUrl], {
			display: ""
		});
	}
	
	return PageCache;
});
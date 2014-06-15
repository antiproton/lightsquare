define(function(require) {
	var create = require("lib/dom/create");
	var style = require("lib/dom/style");
	
	function Pages(parent) {
		this._container = parent;
		this._pages = {};
	}
	
	Pages.prototype.createPage = function(url) {
		if(!this.hasPage(url)) {
			var page = create("div", this._container);
			
			page.className = "page";
			page.style.display = "none";
			
			this._pages[url] = page;
			
			return page;
		}
		
		else {
			throw "Pages - page with url " + url + " already exists";
		}
	}
	
	Pages.prototype.hasPage = function(url) {
		return (url in this._pages);
	}
	
	Pages.prototype.changeUrl = function(oldUrl, newUrl) {
		this._pages[newUrl] = this._pages[oldUrl];
		
		delete this._pages[oldUrl];
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
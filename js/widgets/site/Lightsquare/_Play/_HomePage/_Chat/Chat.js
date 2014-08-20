define(function(require) {
	require("css!./chat.css");
	var html = require("file!./chat.html");
	var Ractive = require("ractive/Ractive");
	
	function Chat(server, parent) {
		this._server = server;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				message: "",
				messages: []
			}
		});
		
		this._scrollOnNewMessages = true;
		this._historyNode = this._template.nodes.history;
		
		this._historyNode.addEventListener("scroll", (function() {
			this._scrollOnNewMessages = (this._historyNode.scrollHeight - this._historyNode.scrollTop === this._historyNode.clientHeight);
		}).bind(this));
		
		this._template.on("send", (function(event) {
			event.original.preventDefault();
			
			this._server.send("/chat", (this._template.get("message") || "").toString());
			this._template.set("message", "");
		}).bind(this));
		
		this._server.subscribe("/chat", (function(message) {
			this._addMessage(message.from, message.body);
		}).bind(this));
	}
	
	Chat.prototype._addMessage = function(body, from) {
		this._template.get("messages").push({
			from: from,
			body: body
		});
			
		if(this._scrollOnNewMessages) {
			this._historyNode.scrollTop = this._historyNode.scrollHeight;
		}
	}
	
	return Chat;
});
define(function(require) {
	require("css!./chat.css");
	var html = require("file!./chat.html");
	var Ractive = require("lib/dom/Ractive");
	
	function Chat(game, parent) {
		this._game = game;
		this._scrollOnNewMessages = true;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				message: "",
				messages: []
			}
		});
		
		var history = this._template.nodes.chat_history;
		
		history.addEventListener("scroll", (function() {
			this._scrollOnNewMessages = (history.scrollHeight - history.scrollTop === history.clientHeight);
		}).bind(this));
		
		this._template.on("send", (function(event) {
			event.original.preventDefault();
			
			this._game.sendChatMessage((this._template.get("message") || "").toString());
			this._template.set("message", "");
		}).bind(this));
		
		this._game.ChatMessageReceived.addHandler(this, function(message) {
			this._addMessage(message.body, message.from);
			
			if(this._scrollOnNewMessages) {
				history.scrollTop = history.scrollHeight;
			}
		});
		
		this._game.DrawOffered.addHandler(this, function() {
			this._addMessage(this._game.getActivePlayer().username + " has offered a draw.");
		});
		
		this._game.GameOver.addHandler(this, function(data) {
			this._addMessage("Game over: " + data.result.description + ".");
		});
	}
	
	Chat.prototype._addMessage = function(body, from) {
		this._template.get("messages").push({
			from: from,
			body: body
		});
	}
	
	return Chat;
});
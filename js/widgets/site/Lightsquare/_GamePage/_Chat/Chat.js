define(function(require) {
	require("css!./chat.css");
	var html = require("file!./chat.html");
	var Ractive = require("lib/dom/Ractive");
	var Colour = require("chess/Colour");
	
	function Chat(game, parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				message: "",
				messages: []
			}
		});
		
		this._scrollOnNewMessages = true;
		this._historyNode = this._template.nodes.chat_history;
		
		this._historyNode.addEventListener("scroll", (function() {
			this._scrollOnNewMessages = (this._historyNode.scrollHeight - this._historyNode.scrollTop === this._historyNode.clientHeight);
		}).bind(this));
		
		this._template.on("send", (function(event) {
			event.original.preventDefault();
			
			this._game.sendChatMessage((this._template.get("message") || "").toString());
			this._template.set("message", "");
		}).bind(this));
		
		this._setupGame(game);
	}
	
	Chat.prototype._setupGame = function(game) {
		this._game = game;
		
		this._addMessage(game.getPlayerName(Colour.white) + " vs. " + game.getPlayerName(Colour.black) + " " + game.getTimingStyle().getDescription());
		
		this._game.ChatMessageReceived.addHandler(this, function(message) {
			this._addMessage(message.body, message.from);
		});
		
		this._game.DrawOffered.addHandler(this, function() {
			this._addMessage(this._game.getPlayerName(this._game.getActiveColour().opposite) + " has offered a draw.");
		});
		
		this._game.RematchOffered.addHandler(this, function() {
			this._addMessage(this._game.getPlayerName(this._game.getUserColour().opposite) + " has offered you a rematch.");
		});
		
		this._game.RematchDeclined.addHandler(this, function() {
			this._addMessage(this._game.getPlayerName(this._game.getUserColour().opposite) + " has declined a rematch.");
		});
		
		this._game.Rematch.addHandler(this, function(game) {
			this._setupGame(game);
		});
		
		this._game.GameOver.addHandler(this, function(result) {
			this._addMessage("Game over: " + result.description + ".");
		});
		
		this._game.Aborted.addHandler(this, function() {
			this._addMessage("Game aborted by the server.");
		});
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
define(function(require) {
	var Event = require("lib/Event");
	var Promisor = require("lib/Promisor");
	var Game = require("./Game");
	
	function RestorationRequest(user, server, backup) {
		this._id = backup.gameDetails.id;
		this._user = user;
		this._server = server;
		this._backup = backup;
		this._promisor = new Promisor(this);
		this._handleServerMessages();
		
		this.GameRestored = new Event(this);
	}
	
	RestorationRequest.prototype.getId = function() {
		return this._id;
	}
	
	RestorationRequest.prototype._handleServerMessages = function() {
		this._server.subscribe("/game/restore/" + this._id + "/success", (function(gameDetails) {
			var game = new Game(this._user, this._server, gameDetails);
			
			if(game.timingHasStarted() && game.getLastMove()) {
				game.addTimeToClock(game.getCurrentTime() - game.getLastMove().getTime());
			}
			
			this._promisor.resolve("/submit", game);
			this.GameRestored.fire(game);
		}).bind(this));
		
		this._server.subscribe("/game/restore/" + this._id + "/canceled", (function() {
			this._promisor.resolve("/cancel");
			this._promisor.fail("/submit", "Request canceled");
		}).bind(this));
		
		this._server.subscribe("/game/restore/" + this._id + "/pending", (function() {
			this._promisor.progress("/submit");
		}).bind(this));
		
		this._server.subscribe("/game/restore/" + this._id + "/failure", (function(reason) {
			this._promisor.fail("/submit", reason);
		}).bind(this));
	}
	
	RestorationRequest.prototype.submit = function() {
		return this._promisor.get("/submit", function() {
			this._server.send("/game/restore", {
				gameDetails: this._backup.gameDetails,
				playingAs: this._backup.playingAs
			});
		});
	}
	
	RestorationRequest.prototype.cancel = function() {
		return this._promisor.get("/cancel", function() {
			this._server.send("/game/restore/cancel", this._id);
		});
	}
	
	return RestorationRequest;
});
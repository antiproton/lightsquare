define(function(require) {
	require("css!./game_backup_list.css");
	var html = require("file!./game_backup_list.html");
	var Event = require("js/Event");
	var Ractive = require("ractive/Ractive");
	var Position = require("chess/Position");
	var Colour = require("chess/Colour");
	var Board = require("widgets/chess/Board/Board");
	
	function GameBackupList(user, server, parent) {
		this._user = user;
		this._server = server;
		this._boards = {};
		this._setupTemplate(parent);
		this._restorationRequests = {};
		
		this.GameRestored = new Event();
		
		this._server.Connected.addHandler(function() {
			this._user.getPendingRestorations().then((function(ids) {
				ids.forEach((function(id) {
					this._template.set("restorationRequestSubmitted." + id, true)
				}).bind(this));
			}).bind(this));
		}, this);
	}
	
	GameBackupList.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				selectedMove: {},
				restorationRequestSubmitted: {},
				gameBackups: {},
				hasBackups: false,
				formatDate: function(time) {
					return new Date(time).toLocaleString();
				}
			}
		});
		
		this._template.on("select_move", (function(event, id) {
			var moveDetails = event.context;
			
			this._boards[id].setBoardArray(new Position(moveDetails.resultingFen).getBoardArray());
			this._template.set("selectedMove." + id, moveDetails);
		}).bind(this));
		
		this._template.on("restore_or_cancel", (function(event, id) {
			var backup = event.context;
			var request = this._getRestorationRequest(backup);
			
			this._template.set("error." + id, null);
			
			if(this._template.get("restorationRequestSubmitted." + id)) {
				request.cancel();
			}
			
			else {
				request.submit();
			}
		}).bind(this));
	}
	
	GameBackupList.prototype.refresh = function() {
		var backups = this._user.getGameBackups();
		var hasBackups = false;
		var backup;
		
		for(var id in backups) {
			hasBackups = true;
			
			break;
		}
		
		this._boards = {};
		this._template.set("gameBackups", {});
		this._template.set("hasBackups", hasBackups);
		
		for(var id in backups) {
			backup = backups[id];
			
			var history = backup.gameDetails.history;
			var lastMove = history[history.length - 1];
			
			this._template.set("gameBackups." + id, backup);
			this._template.set("selectedMove." + id, lastMove);
			
			var board  = new Board(this._template.nodes["board_" + id]);
			
			board.setSquareSize(Board.sizes["Tiny"]);
			board.setShowCoords(false);
			board.setBoardArray(new Position(lastMove.resultingFen).getBoardArray());
			board.setViewingAs(Colour.fromFenString(backup.playingAs));
			
			this._boards[id] = board;
		}
	}
	
	GameBackupList.prototype._getRestorationRequest = function(backup) {
		var id = backup.gameDetails.id;
		var request;
		
		if(id in this._restorationRequests) {
			request = this._restorationRequests[id];
		}
		
		else {
			request = this._restorationRequests[id] = this._user.createRestorationRequest(backup);
			
			request.onProgress((function() {
				this._template.set("restorationRequestSubmitted." + id, true);
			}).bind(this));
			
			request.then((function() {
				this.refresh();
			}).bind(this), (function(error) {
				this._template.set("error." + id, error);
			}).bind(this), (function() {
				this._template.set("restorationRequestSubmitted." + id, false);
				
				delete this._restorationRequests[id];
			}).bind(this));
			
			request.GameRestored.addHandler(function() {
				this.GameRestored.fire();
			}, this);
		}
		
		return request;
	}
	
	return GameBackupList;
});
define(function(require) {
	require("css!./game_backup_list.css");
	var html = require("file!./game_backup_list.html");
	var Board = require("widgets/chess/Board/Board");
	var Position = require("chess/Position");
	var Colour = require("chess/Colour");
	
	function GameBackupList(user, parent) {
		this._user = user;
		
		this._boards = {};
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				gameBackups: {},
				formatDate: function(time) {
					var date = new Date(time);
					
					return date.toLocaleString();
				}
			}
		});
		
		this._template.on("select_move", (function(event, id) {
			this._boards[id].setBoardArray(new Position(event.context.resultingFen).getBoardArray());
			this._template.set("selectedMove." + id, event.context);
		}).bind(this));
		
		this._template.on("restore_or_cancel", (function(event, id) {
			var backup = event.context;
			
			if(backup.restorationRequestSubmitted) {
				this._user.cancelGameRestoration(id).then((function() {
					this._template.set("gameBackups." + id + ".restorationRequestSubmitted", false);
				}).bind(this));
			}
			
			else {
				this._user.requestGameRestoration(backup).then((function() {
					this._template.set("gameBackups." + id + ".restorationRequestSubmitted", true);
				}).bind(this), (function(error) {
					this._template.set("error." + id, error);
				}).bind(this));
			}
		}).bind(this));
	}
	
	GameBackupList.prototype.refresh = function() {
		var backups = this._user.getGameBackups();
		var backup;
		
		this._boards = {};
		this._template.set("gameBackups", {});
		
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
	
	return GameBackupList;
});
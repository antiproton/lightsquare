define(function(require) {
	require("css!./game_backup_list.css");
	var html = require("file!./game_backup_list.html");
	var Board = require("widgets/chess/Board/Board");
	var Position = require("chess/Position");
	
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
		}).bind(this));
	}
	
	GameBackupList.prototype.refresh = function() {
		var backups = this._user.getGameBackups();
		var backup;
		
		this._boards = {};
		this._template.set("gameBackups", {});
		
		for(var id in backups) {
			backup = backups[id];
			
			this._template.set("gameBackups." + id, backup);
			
			var board  = new Board(this._template.nodes["board_" + id]);
			var history = backup.gameDetails.history;
			
			board.setSquareSize(Board.sizes["Tiny"]);
			board.setShowCoords(false);
			board.setBoardArray(new Position(history[history.length - 1].resultingFen).getBoardArray());
			
			this._boards[id] = board;
			
		}
	}
	
	return GameBackupList;
});
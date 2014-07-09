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
			}
		});
	}
	
	GameBackupList.prototype.refresh = function() {
		var backups = this._user.getGameBackups();
		
		this._boards = {};
		this._template.set("gameBackups", {});
		
		for(var id in backups) {
			
			this._template.set("gameBackups." + id, backups[id]);
			
			var board  = new Board(this._template.nodes["board_" + id]);
			
			board.setSquareSize(20);
			board.setShowCoords(false);
			this._boards[id] = board;
			
		}
	}
	
	return GameBackupList;
});
define(function(require) {
	var Ractive = require("lib/dom/Ractive");
	var html = require("file!./game_backup_list.html");
	
	function GameBackupList(user, parent) {
		this._user = user;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				backups: this._user.getGameBackups()
			}
		});
	}
	
	return GameBackupList;
});
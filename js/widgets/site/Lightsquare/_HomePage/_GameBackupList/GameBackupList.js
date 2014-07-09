define(function(require) {
	require("css!./game_backup_list.css");
	var html = require("file!./game_backup_list.html");
	
	function GameBackupList(user, parent) {
		this._user = user;
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				gameBackups: this._user.getGameBackups()
			}
		});
	}
	
	return GameBackupList;
});
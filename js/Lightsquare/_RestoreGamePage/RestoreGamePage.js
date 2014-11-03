define(function(require) {
	require("css!./restore_game_page.css");
	var html = require("file!./restore_game_page.html");
	var Ractive = require("ractive/ractive");
	var GameBackupList = require("./_GameBackupList/GameBackupList");
	
	function RestoreGamePage(user, server, parent) {
		this._template = new Ractive({
			el: parent,
			template: html
		});
		
		this._backupList = new GameBackupList(user, server, this._template.nodes.backup_list);
	}
	
	RestoreGamePage.prototype.show = function() {
		this._backupList.refresh();
	}
	
	return RestoreGamePage;
});
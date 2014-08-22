define(function(require) {
	require("css!./restore_game_page.css");
	var html = require("file!./restore_game_page.html");
	var Ractive = require("ractive/Ractive");
	var GameBackupList = require("./_GameBackupList/GameBackupList");
	
	function RestoreGamePage(user, server, router, parent) {
		this._template = new Ractive({
			el: parent,
			template: html
		});
		
		var backupList = new GameBackupList(user, server, this._template.nodes.backup_list);
		
		router.addRoute("/", (function() {
			backupList.refresh();
		}).bind(this));
		
		router.execute();
	}
	
	return RestoreGamePage;
});
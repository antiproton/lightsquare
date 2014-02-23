define(function(require) {
	var Template = require("lib/dom/Template");
	var Board = require("widgets/Board/Board");
	var History = require("widgets/History/History");
	var html = require("file@./resources/table.html");
	require("css@./resources/table.css");

	function Table(parent) {
		this._template = new Template(html, parent);

		//this.playerInfo = {
		//	player: new PlayerInfo(this._template.player_info_player),
		//	opponent: new PlayerInfo(this._template.player_info_opponent)
		//};
		//
		//this.playerClock = {
		//	player: new PlayerClock(this._template.player_clock_player),
		//	opponent: new PlayerClock(this._template.player_clock_opponent)
		//};

		this.board = new Board(this._template.board);
		this.history = new History(this._template.history);
	}

	return Table;
});
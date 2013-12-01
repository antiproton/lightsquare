function UiLiveTableStandard(parent) {
	this._tpl=new Template("live_table_standard", parent);

	this.playerInfo={
		player: new PlayerInfo(this._tpl.player_info_player),
		opponent: new PlayerInfo(this._tpl.player_info_opponent)
	};

	this.playerClock={
		player: new PlayerClock(this._tpl.player_clock_player),
		opponent: new PlayerClock(this._tpl.player_clock_opponent)
	};

	this.board=new UiBoard(this._tpl.board);
	this.history=new HistoryColView(this._tpl.history);
}
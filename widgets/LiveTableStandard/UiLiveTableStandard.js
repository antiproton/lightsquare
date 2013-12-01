function UiLiveTableStandard(parent) {
	this.tpl=new Template("live_table_standard", parent);

	this.PlayerInfo={
		Player: new PlayerInfo(this.tpl.player_info_player),
		Opponent: new PlayerInfo(this.tpl.player_info_opponent)
	};

	this.PlayerClock={
		Player: new PlayerClock(this.tpl.player_clock_player),
		Opponent: new PlayerClock(this.tpl.player_clock_opponent)
	};

	this.Board=new UiBoard(this.tpl.board);
	this.History=new HistoryColView(this.tpl.history);
}
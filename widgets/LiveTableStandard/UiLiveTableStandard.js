function UiLiveTableStandard(parent) {
	this._template=new Template("live_table_standard", parent);

	this.playerInfo={
		player: new PlayerInfo(this._template.player_info_player),
		opponent: new PlayerInfo(this._template.player_info_opponent)
	};

	this.playerClock={
		player: new PlayerClock(this._template.player_clock_player),
		opponent: new PlayerClock(this._template.player_clock_opponent)
	};

	this.board=new BoardWidget(this._template.board);
	this.history=new HistoryColView(this._template.history);
}
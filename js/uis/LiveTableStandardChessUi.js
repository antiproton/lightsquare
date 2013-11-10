function LiveTableStandardChessUi(parent) {
	this.tpl=new Template(parent, "live_table_standard_chess");

	this.PlayerInfo={
		Player: new PlayerInfo(this.tpl.player_info_player),
		Opponent: new PlayerInfo(this.tpl.player_info_opponent)
	};

	this.PlayerClock={
		Player: new PlayerClock(this.tpl.player_clock_player),
		Opponent: new PlayerClock(this.tpl.player_clock_opponent)
	};

	this.Board=new UiBoard(this.tpl.board);
}
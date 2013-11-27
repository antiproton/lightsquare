/*
user interface for a standard chess live table
*/

function LiveTableStdUi(parent) {
	this.tpl=new Template("live_table_std", parent);

	this.PlayerInfo={
		Player: new PlayerInfo(this.tpl.player_info_player),
		Opponent: new PlayerInfo(this.tpl.player_info_opponent)
	};

	this.PlayerClock={
		Player: new PlayerClock(this.tpl.player_clock_player),
		Opponent: new PlayerClock(this.tpl.player_clock_opponent)
	};

	this.Board=new UiBoard(this.tpl.board);
	this.History=new UiHistoryColView(this.tpl.history);
}
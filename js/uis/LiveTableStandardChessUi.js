function LiveTableStandardChessUi(parent) {
	this.template=new Template(parent, "live_table_standard_chess");

	this.PlayerInfo={
		Player: new PlayerInfo(this.template.player_info_player),
		Opponent: new PlayerInfo(this.template.player_info_opponent)
	};
}
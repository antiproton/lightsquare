function TournamentLobby(parent, tournament) {
	Control.implement(this, parent);

	this.Tournament=tournament;

	this.SetupHtml();
}

TournamentLobby.prototype.SetupHtml=function() {
	this.UpdateHtml();
}

TournamentLobby.prototype.UpdateHtml=function() {

}
function Tournament() {
	this.Owner=Base.App.User.Username;
	this.Title="Untitled Tournament";
	this.Format=TOURNAMENT_FORMAT_WARZONE;
	this.Rounds=5;
	this.MtimeStart=0;
	this.Players=0;
	this.Variant=VARIANT_STANDARD;
	this.TimingStyle=TIMING_FISCHER_AFTER;
	this.TimingInitial=300;
	this.TimingIncrement=0;
	this.TimingOvertime=false;
	this.TimingOvertimeIncrement=300;
	this.TimingOvertimeCutoff=40;
}

Tournament.prototype.Load=function(id) {
	this
}

Tournament.prototype.Save=function() {
	if(this.is_new) {

	}

	else {

	}
}
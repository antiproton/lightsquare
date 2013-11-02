/*
this acts as the time interface between the LiveGame and the LiveTable.

with the Board and the History the LiveTable just passed the game whatever
ui element it was, but with the clocks the LiveGame just updates the Clock,
which then fires an event, which is caught by the LiveTable, which updates
the right PlayerClock.

The LiveGame does the ticking, not the Clock or the PlayerClock
*/

function Clock() {
	this.GameId=null;
	this.Mtime=[0, 0];
	this.Update=new Event(this);
}

Clock.prototype.SetMtime=function(mtime, colour) {
	this.Mtime[colour]=Math.max(0, mtime);
	this.Update.Fire();
}

Clock.prototype.GetMtime=function(colour) {
	return this.Mtime[colour];
}

Clock.prototype.AddMtime=function(msecs_diff, colour) {
	this.Mtime[colour]=Math.max(0, this.Mtime[colour]+msecs_diff);
	this.Update.Fire();
}

Clock.prototype.Reset=function() {
	this.Mtime[WHITE]=0;
	this.Mtime[BLACK]=0;
}
/*
this acts as the time interface between the LiveGame and the LiveTable.

with the Board and the History the LiveTable just passed the game whatever
ui element it was, but with the clocks the LiveGame just updates the Clock,
which then fires an event, which is caught by the LiveTable, which updates
the right PlayerClock.

The LiveGame does the ticking, not the Clock or the PlayerClock
*/

function Clock() {
	this.gameId=null;
	this.mtime=[0, 0];
	this.Update=new Event(this);
}

Clock.prototype.setMtime=function(mtime, colour) {
	this.mtime[colour]=Math.max(0, mtime);
	this.Update.fire();
}

Clock.prototype.getMtime=function(colour) {
	return this.mtime[colour];
}

Clock.prototype.addMtime=function(msecs_diff, colour) {
	this.mtime[colour]=Math.max(0, this.mtime[colour]+msecs_diff);
	this.Update.fire();
}

Clock.prototype.reset=function() {
	this.mtime[WHITE]=0;
	this.mtime[BLACK]=0;
}
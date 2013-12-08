function UiHistory() {
	History.implement(this);

	this.UserSelect=new Event(this);
}

UiHistory.prototype.select=function(move) {
	History.prototype.select.call(this, move);

	if(move!==null) {
		/*
		TODO make sure the move is in view if the history has a scrollbar
		*/
	}
}

UiHistory.prototype._setupMove=function(move) {
	move.UserSelect.addHandler(this, function(data, sender) {
		this.select(sender);
	});
}
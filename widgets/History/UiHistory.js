function UiHistory() {
	History.implement(this);

	this.UserSelect=new Event(this);
}

UiHistory.prototype.Select=function(move) {
	History.prototype.Select.call(this, move);

	if(move!==null) {
		/*
		TODO make sure the move is in view if the history has a scrollbar
		*/
	}
}

UiHistory.prototype.setup_move=function(move) {
	move.UserSelect.AddHandler(this, function(data, sender) {
		this.Select(sender);
	});
}
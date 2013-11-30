function UiMove() {
	Move.implement(this);

	this.UserSelect=new Event(this);
}

UiMove.prototype.Select=function() {
	$(this.Node).addClass("move_selected");
}

UiMove.prototype.Deselect=function() {
	$(this.Node).removeClass("move_selected");
}
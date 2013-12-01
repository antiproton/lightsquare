function UiMove() {
	Move.implement(this);

	this.UserSelect=new Event(this);
}

UiMove.prototype.select=function() {
	$(this.Node).addClass("move_selected");
}

UiMove.prototype.deselect=function() {
	$(this.node).removeClass("move_selected");
}
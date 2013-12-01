function UiMove() {
	Move.implement(this);

	this.UserSelect=new Event(this);
}

UiMove.prototype.select=function() {
	this.node.classList.add("move_selected");
}

UiMove.prototype.deselect=function() {
	this.node.classList.remove("move_selected");
}
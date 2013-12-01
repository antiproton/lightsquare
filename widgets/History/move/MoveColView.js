function MoveColView() {
	UiMove.implement(this);

	this._tpl=new Template("move_colview");
	this.node=this._tpl.root;
}

MoveColView.prototype.isFullmoveDisplayed=function() {
	return false;
}
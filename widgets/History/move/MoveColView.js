function MoveColView() {
	UiMove.implement(this);

	this.parentFullmove=null;
	this._template=new Template("move_colview");
	this.node=this._template.root;
}

MoveColView.prototype.isFullmoveDisplayed=function() {
	return false;
}

MoveColView.prototype.setHalfmove=function() {
	this.parentFullmove.setFullmove(this.getFullmove());
}
function IUiMoveColView() {
	IUiMove.implement(this);
	this.ParentFullmove=null;
}

IUiMoveColView.prototype.UpdateHtml=function() {
	this.DisplayFullmove=false;

	IUiMove.prototype.UpdateHtml.call(this);
}
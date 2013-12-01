function MoveColView() {
	UiMove.implement(this);
	this.tpl=new Template("move_colview");
	this.node=this.tpl.root;
	this.parentFullmove=null;
}
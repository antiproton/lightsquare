function MoveColView() {
	UiMove.implement(this);
	this.tpl=new Template("move_colview");
	this.Node=this.tpl.root;
	this.ParentFullmove=null;
}
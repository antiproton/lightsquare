function UiVariationColView(history) {
	Variation.implement(this, history, true);

	this.tpl=new Template("variation_colview");
	this.Node=this.tpl.root;
	this.tpl.root.appendChild(this.MoveList.Node);
}

UiVariationColView.prototype.create_move_list=function() {
	return new UiMoveListColView();
}
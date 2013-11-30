function VariationColView(history) {
	Variation.implement(this, history, true);

	this.tpl=new Template("variation_colview");
	this.Node=this.tpl.root;
	this.tpl.root.appendChild(this.MoveList.Node);
}

VariationColView.prototype.create_move_list=function() {
	return new MoveListColView();
}
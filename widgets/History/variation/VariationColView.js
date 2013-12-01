function VariationColView(history) {
	Variation.implement(this, history, true);

	this.tpl=new Template("variation_colview");
	this.node=this.tpl.root;
	this.tpl.root.appendChild(this.moveList.node);
}

VariationColView.prototype._createMoveList=function() {
	return new MoveListColView();
};
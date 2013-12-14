function VariationColView() {
	Variation.implement(this);

	this._template=new Template("variation_colview");
	this._template.root.appendChild(this.moveList.node);
	this.node=this._template.root;
}

VariationColView.prototype._createMoveList=function() {
	return new MoveListColView();
}
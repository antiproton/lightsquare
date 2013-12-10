function VariationColView() {
	Variation.implement(this);

	this._template=new Template("variation_colview");
	this.node=this._template.root;
	this._template.root.appendChild(this.moveList.node);
}

VariationColView.prototype._createMoveList=function() {
	return new MoveListColView();
}
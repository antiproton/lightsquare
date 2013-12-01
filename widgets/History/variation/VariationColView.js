function VariationColView() {
	Variation.implement(this);

	this._tpl=new Template("variation_colview");
	this.node=this._tpl.root;
	this._tpl.root.appendChild(this.moveList.node);
}

VariationColView.prototype._createMoveList=function() {
	return new MoveListColView();
}

VariationColView.prototype.updatePointers=function() {
	Variation.prototype.updatePointers.call(this);

	this.moveList.setStartingFullmove(this._startingFullmove);
}
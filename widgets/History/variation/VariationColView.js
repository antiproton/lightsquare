function VariationColView(history) {
	Variation.implement(this, history, true);

	this._tpl=new Template("variation_colview");
	this.node=this._tpl.root;
	this._tpl.root.appendChild(this.moveList.node);
}

VariationColView.prototype._createMoveList=function() {
	return new MoveListColView();
};
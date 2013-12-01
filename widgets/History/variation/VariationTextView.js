function VariationTextView() {
	Variation.implement(this);

	this._tpl=new Template("variation_textview");

	this._tpl.root.appendChild(this.moveList.node);
}

VariationTextView.prototype.createMoveList=function() {
	return new MoveListTextView(this._tpl.move_list_container);
}
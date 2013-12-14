function VariationTextView() {
	Variation.implement(this);

	this._template=new Template("variation_textview");
	this._template.root.appendChild(this.moveList.node);
	this.node=this._template.root;
}

VariationTextView.prototype.createMoveList=function() {
	return new MoveListTextView();
}
function VariationTextView(history, isMainline) {
	Variation.implement(this, history, isMainline);

	this.tpl=new Template("variation_textview");

	this.tpl.root.appendChild(this.moveList.node);
}

VariationTextView.prototype.createMoveList=function() {
	return new MoveListTextView(this.tpl.move_list_container);
}
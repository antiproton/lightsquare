function UiVariationTextView(history, is_mainline) {
	Variation.implement(this, history, is_mainline);

	this.tpl=new Template("variation_textview");

	this.tpl.root.appendChild(this.MoveList.Node);
}

UiVariationTextView.prototype.create_move_list=function() {
	return new UiMoveListTextView(this.tpl.move_list_container);
}
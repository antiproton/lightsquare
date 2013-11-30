function VariationTextView(history, is_mainline) {
	Variation.implement(this, history, is_mainline);

	this.tpl=new Template("variation_textview");

	this.tpl.root.appendChild(this.MoveList.Node);
}

VariationTextView.prototype.create_move_list=function() {
	return new MoveListTextView(this.tpl.move_list_container);
}
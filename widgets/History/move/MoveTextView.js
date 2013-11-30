function MoveTextView() {
	UiMove.implement(this);

	this.tpl=new Template("move_textview");
	this.Node=this.tpl.root;
}

MoveTextView.prototype.SetPreviousVariation=function(variation) {
	Move.prototype.SetPreviousVariation.call(this, variation);

	this.update_fullmove_display();
}

MoveTextView.prototype.SetFullmove=function(fullmove) {
	this.Fullmove=fullmove;
	this.update_fullmove();
}

MoveTextView.prototype.SetHalfmove=function(halfmove) {
	this.Halfmove=halfmove;
	this.update_fullmove();
}

MoveTextView.prototype.update_fullmove=function() {
	this.tpl.fullmove.style.visibility=(
		this.DisplayFullmove.Get()?
		"visible":
		"hidden"
	);

	this.tpl.fullmove.innerHTML=this.Fullmove+this.Dot.Get();
}
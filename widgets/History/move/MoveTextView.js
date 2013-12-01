function MoveTextView() {
	UiMove.implement(this);

	this.tpl=new Template("move_textview");
	this.node=this.tpl.root;
}

MoveTextView.prototype.setPreviousVariation=function(variation) {
	Move.prototype.setPreviousVariation.call(this, variation);

	this._updateFullmove();
}

MoveTextView.prototype.setFullmove=function(fullmove) {
	this.fullmove=fullmove;
	this._updateFullmove();
}

MoveTextView.prototype.setHalfmove=function(halfmove) {
	this.halfmove=halfmove;
	this._updateFullmove();
}

MoveTextView.prototype._updateFullmove=function() {
	this.tpl.fullmove.style.visibility=(
		this.displayFullmove.get()?
		"visible":
		"hidden"
	);

	this.tpl.fullmove.innerHTML=this.fullmove+this.dot.Get();
}
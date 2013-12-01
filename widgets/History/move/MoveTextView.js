function MoveTextView() {
	UiMove.implement(this);

	this._tpl=new Template("move_textview");
	this.node=this._tpl.root;
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
	this._tpl.fullmove.style.visibility=(
		this.displayFullmove.get()?
		"visible":
		"hidden"
	);

	this._tpl.fullmove.innerHTML=this.fullmove+this.dot.Get();
}
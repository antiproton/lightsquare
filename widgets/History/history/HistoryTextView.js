function HistoryTextView(parent) {
	UiHistory.implement(this);

	this.tpl=new Template("history_textview", parent);
	this.tpl.root.appendChild(this.MainLine.node);
}

HistoryTextView.prototype._createMove=function() {
	var move=new MoveTextView();

	this._setupMove(move);

	return move;
}

HistoryTextView.prototype._createVariation=function() {
	return new VariationTextView(this);
}
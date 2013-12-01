function HistoryTextView(parent) {
	UiHistory.implement(this);

	this._tpl=new Template("history_textview", parent);
	this._tpl.root.appendChild(this.mainLine.node);
}

HistoryTextView.prototype.createMove=function() {
	var move=new MoveTextView();

	this._setupMove(move);

	return move;
}

HistoryTextView.prototype.createVariation=function() {
	return new VariationTextView();
}
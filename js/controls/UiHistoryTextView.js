function UiHistoryTextView(parent) {
	UiHistory.implement(this);

	this.tpl=new Template("history_textview", parent);
	this.tpl.root.appendChild(this.MainLine.Node);
}

UiHistoryTextView.prototype.CreateMove=function() {
	var move=new UiMoveTextView();

	this.setup_move(move);

	return move;
}

UiHistoryTextView.prototype.CreateVariation=function() {
	return new UiVariationTextView(this);
}
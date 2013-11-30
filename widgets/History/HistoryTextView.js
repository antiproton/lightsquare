function HistoryTextView(parent) {
	UiHistory.implement(this);

	this.tpl=new Template("history_textview", parent);
	this.tpl.root.appendChild(this.MainLine.Node);
}

HistoryTextView.prototype.CreateMove=function() {
	var move=new MoveTextView();

	this.setup_move(move);

	return move;
}

HistoryTextView.prototype.CreateVariation=function() {
	return new VariationTextView(this);
}
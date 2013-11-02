function UiHistoryTextView(parent) {
	IUiHistory.implement(this, parent);
}

UiHistoryTextView.prototype.Move=function(move) {
	IUiMoveTextView.implement(move);

	return IHistoryCommon.prototype.Move.call(this, move);
}
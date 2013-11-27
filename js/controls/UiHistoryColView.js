function UiHistoryColView(parent) {
	UiHistory.implement(this);

	this.tpl=new Template("history_colview", parent);
	this.tpl.root.appendChild(this.MainLine.Node);
}

UiHistoryColView.prototype.Move=function(move) {
	this.MainLine.Add(move);

	this.Moved.Fire({
		Move: move
	});

	this.Select(move);

	return true;
}

UiHistoryColView.prototype.CreateVariation=function() {
	return new UiVariationColView(this);
}

UiHistoryColView.prototype.CreateMove=function() {
	var move=new UiMoveColView();

	UiHistory.prototype.setup_move.call(this, move);

	return move;
}
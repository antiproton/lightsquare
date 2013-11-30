function HistoryColView(parent) {
	UiHistory.implement(this);

	this.tpl=new Template("history_colview", parent);
	this.tpl.root.appendChild(this.MainLine.Node);
}

HistoryColView.prototype.Move=function(move) {
	this.MainLine.Add(move);

	this.Moved.Fire({
		Move: move
	});

	this.Select(move);

	return true;
}

HistoryColView.prototype.CreateVariation=function() {
	return new VariationColView(this);
}

HistoryColView.prototype.CreateMove=function() {
	var move=new MoveColView();

	UiHistory.prototype.setup_move.call(this, move);

	return move;
}
function HistoryColView(parent) {
	UiHistory.implement(this);

	this.tpl=new Template("history_colview", parent);
	this.tpl.root.appendChild(this.mainLine.node);
}

HistoryColView.prototype.move=function(move) {
	this.mainLine.add(move);

	this.Moved.Fire({
		move: move
	});

	this.select(move);

	return true;
}

HistoryColView.prototype.createVariation=function() {
	return new VariationColView(this);
}

HistoryColView.prototype.createMove=function() {
	var move=new MoveColView();

	UiHistory.prototype._setupMove.call(this, move);

	return move;
}
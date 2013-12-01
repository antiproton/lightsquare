function HistoryColView(parent) {
	UiHistory.implement(this);

	this._tpl=new Template("history_colview", parent);
	this._tpl.root.appendChild(this.mainLine.node);
}

HistoryColView.prototype.move=function(move) {
	this.mainLine.add(move);

	this.Moved.fire({
		move: move
	});

	this.select(move);

	return true;
}

HistoryColView.prototype.createVariation=function() {
	return new VariationColView();
}

HistoryColView.prototype.createMove=function() {
	var move=new MoveColView();

	this._setupMove(move);

	return move;
}
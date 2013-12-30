define(function(require) {
	require("lib/Function.implement");
	var HistoryItem=require("chess/history/HistoryItem");

	function Move(move) {
		HistoryItem.call(this);

		this.itemType=HistoryItem.MOVE;
		this._move=move;
	}

	Move.implement(HistoryItem);

	Move.prototype.getMove=function() {
		return this._move;
	}

	return Move;
});
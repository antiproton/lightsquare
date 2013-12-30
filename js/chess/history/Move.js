define(function(require) {
	require("lib/Function.implement");
	var HistoryItem=require("chess/history/HistoryItem");

	function Move(move) {
		HistoryItem.call(this);

		this.itemType=HistoryItem.MOVE;
		this._move=move;
	}

	Move.implement(HistoryItem);

	Move.prototype.getFullmove=function() {
		return this._move.getFullmove();
	}

	Move.prototype.getColour=function() {
		return this._move.getColour();
	}

	Move.prototype.getDot=function() {
		return this._move.getDot();
	}

	Move.prototype.getLabel=function() {
		return this._move.getLabel();
	}

	Move.prototype.getFullLabel=function() {
		return this._move.getFullLabel();
	}

	Move.prototype.getResultingFen=function() {
		return this._move.getResultingFen();
	}

	return Move;
});
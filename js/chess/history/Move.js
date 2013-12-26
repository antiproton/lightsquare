define(function(require) {
	require("lib/Function.implement");
	var HistoryItem=require("chess/history/HistoryItem");

	function Move() {
		HistoryItem.call(this);
		this.itemType=HistoryItem.MOVE;
		this._isSelected=false;
		this._label="";

	}
	Move.implement(HistoryItem);


	Move.prototype.select=function() {
		this._isSelected=true;
	}

	Move.prototype.deselect=function() {
		this._isSelected=false;
	}

	Move.prototype.isSelected=function() {
		return this._isSelected;
	}

	Move.prototype.setLabel=function(label) {
		this._label=label;
	}

	Move.implement(HistoryItem);

	return Move;
});

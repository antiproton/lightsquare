define(function(require) {
	var HistoryItem=require("./HistoryItem");	HistoryItem.call(this);

	function Class() {
		this.itemType=HistoryItem.MOVE;

		this._isSelected=false;
		this._label="";

	}



	Class.prototype.select=function() {
		this.isSelected=true;
	}

	Class.prototype.deselect=function() {
		this.isSelected=false;
	}

	Class.prototype.isSelected=function() {
		return this._isSelected;
	}

	Class.prototype.setLabel=function(label) {
		this._label=label;
	}

	Class.implement(HistoryItem);
});

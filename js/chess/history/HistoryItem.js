define(function(require) {
	function HistoryItem() {
		this._variation=null;
		this._previousItem=null;
		this._nextItem=null;
		this.itemType;
	}

	HistoryItem.MOVE=0;
	HistoryItem.VARIATION=1;

	HistoryItem.prototype.getPreviousMove=function() {
		var item=this.getPreviousItem();

		while(item && item.itemType!==HistoryItem.MOVE) {
			item=item.getPreviousItem();
		}

		return item;
	}

	HistoryItem.prototype.getNextMove=function() {
		var item=this.getNextItem();

		while(item && item.itemType!==HistoryItem.MOVE) {
			item=item.getNextItem();
		}

		return item;
	}

	HistoryItem.prototype.getPreviousVariation=function() {
		if(this._previousItem!==null && this._previousItem.itemType===HistoryItem.VARIATION) {
			return this._previousItem;
		}

		else {
			return null;
		}
	}

	HistoryItem.prototype.getNextVariation=function() {
		if(this._nextItem!==null && this._nextItem.itemType===HistoryItem.VARIATION) {
			return this._nextItem;
		}

		else {
			return null;
		}
	}

	HistoryItem.prototype.getPreviousItem=function() {
		return this._previousItem;
	}

	HistoryItem.prototype.getNextItem=function() {
		return this._nextItem;
	}

	HistoryItem.prototype.getVariation=function() {
		return this._variation;
	}

	HistoryItem.prototype.setVariation=function(variation) {
		this._variation=variation;
	}

	HistoryItem.prototype.setPreviousItem=function(item) {
		this._previousItem=item;
	}

	HistoryItem.prototype.setNextItem=function(item) {
		this._nextItem=item;
	}

	return HistoryItem;
});
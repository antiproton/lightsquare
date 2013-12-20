define(function(require) {
	function Class() {
		this._variation=null;
		this._previousItem=null;
		this._nextItem=null;
		this.itemType;
	}

	Class.MOVE=0;
	Class.VARIATION=1;

	Class.prototype.getPreviousMove=function() {
		var item=this.getPreviousItem();

		while(item && item.itemType!==Class.MOVE) {
			item=item.getPreviousItem();
		}

		return item;
	}

	Class.prototype.getNextMove=function() {
		var item=this.getNextItem();

		while(item && item.itemType!==Class.MOVE) {
			item=item.getNextItem();
		}

		return item;
	}

	Class.prototype._getItemOfType=function(item, type) {
		return (item!==null && item.itemType===type)?item:null;
	}

	Class.prototype.getPreviousVariation=function() {
		return this._getItemOfType(this._previousItem, Class.VARIATION);
	}

	Class.prototype.getNextVariation=function() {
		return this._getItemOfType(this._nextItem, Class.VARIATION);
	}

	Class.prototype.getPreviousItem=function() {
		return this._previousItem;
	}

	Class.prototype.getNextItem=function() {
		return this._nextItem;
	}

	Class.prototype.getVariation=function() {
		return this._variation;
	}

	Class.prototype.setVariation=function(variation) {
		this._variation=variation;
	}

	Class.prototype.setPreviousItem=function(item) {
		this._previousItem=item;
	}

	Class.prototype.setNextItem=function(item) {
		this._nextItem=item;
	}

	return Class;
});
function Variation() {
	HistoryItem.implement(this);

	this._startingFullmove=1;
	this._startingColour=WHITE;
	this._branchMove=null;
	this.isVariation=true;
	this.moveList=this._createMoveList();
	this._firstMove=null;
	this._lastMove=null;
}

Variation.prototype.getStartingFullmove=function() {
	return this._startingFullmove;
}

Variation.prototype.setStartingFullmove=function(fullmove) {
	this._startingFullmove=fullmove;
	this._updatePointers(true);
}

Variation.prototype.getStartingColour=function() {
	return this._startingColour;
}

Variation.prototype.setStartingColour=function(colour) {
	this._startingColour=colour;
	this._updatePointers(true);
}

Variation.prototype.resetPointers=function() {
	HistoryItem.prototype.resetPointers.call(this);

	this._branchMove=null; //the move before the first move of the variation
}

Variation.prototype.setBranchMove=function(move) {
	this._branchMove=move;
}

Variation.prototype.getBranchMove=function() {
	return this._branchMove;
}

Variation.prototype._insert=function(item, index) {
	this.moveList.insert(item, index);
}

Variation.prototype.insert=function(item, index) {
	this._insert(item, index);
	this._updatePointers();
}

Variation.prototype._remove=function(item) {
	this.moveList.remove(item);
}

Variation.prototype.remove=function(item) {
	this._remove(item);
	this._updatePointers();
}

Variation.prototype.deleteMove=function(move) {
	var item=move;

	while(item!==null) {
		this._remove(item);
		item=item.nextItem;
	}

	this._updatePointers();
}

Variation.prototype.add=function(item) {
	this._insert(item, this.moveList.length);
	this._updatePointers();
}

Variation.prototype.insertAfter=function(item, prevItem) {
	if(prevItem===null) {
		this.insert(item, 0);
	}

	else {
		var i=0;

		this.moveList.each(function(item, index) {
			if(item===prevItem) {
				i=index;

				return true;
			}
		});

		this.insert(item, i+1);
	}
}

/*
insertAfterMove - the item will come after the move and all its variations
*/

Variation.prototype.insertAfterMove=function(item, prevMove) {
	if(prevMove===null) {
		this.insert(item, 0);
	}

	else {
		var prevItem=prevMove;

		while(prevItem.nextVariation!==null) {
			prevItem=prevItem.nextVariation;
		}

		this.insertAfter(item, prevItem);
	}
}

Variation.prototype._updatePointers=function() {
	this._firstMove=null;
	this._lastMove=null;

	if(this.moveList.length>0) {
		var lastMove=null;
		var previousVariation=null;
		var lastItem=null;
		var moveIndex=0;
		var halfmove=Util.getHalfmove(this._startingFullmove, this._startingColour);

		if(!this.isMainline()) {
			halfmove=this.getBranchMove().getHalfmove();
		}

		this._firstMove=this.moveList.firstItem();

		this.moveList.each(function(item, i) {
			item.resetPointers();
			item.setVariation(this);
			item.setItemIndex(i);
			item.setPreviousMove(lastMove);
			item.setPreviousItem(lastItem);

			if(item.isVariation) {
				item.setBranchMove(lastMove);

				if(lastItem!==null) {
					lastItem.setNextVariation(item);
				}

				previousVariation=item;
			}

			else {
				this._lastMove=item;

				item.setPreviousVariation(previousVariation);
				item.setHalfmove(halfmove);
				item.setMoveIndex(moveIndex);

				if(lastItem!==null) {
					lastItem.setNextMove(item);
				}

				if(lastMove!==null) {
					lastMove.setNextMove(item);
				}

				lastMove=item;
				previousVariation=null;
				halfmove++;
				moveIndex++;
			}

			if(lastItem!==null) {
				lastItem.setNextItem(item);
			}

			lastItem=item;
		}, this);
	}
}

Variation.prototype.isMainline=function() {
	return (this._variation===null);
}

Variation.prototype._createMoveList=function() {
	return new List();
}
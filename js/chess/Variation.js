define(function(require) {
	var HistoryItem=require("./HistoryItem");

	function Variation() {
		HistoryItem.call(this);

		this.itemType=HistoryItem.VARIATION;

		this._startingFullmove=1;
		this._startingColour=WHITE;

		this.moveList=this._createMoveList();
	}

	Variation.implement(HistoryItem);

	Variation.prototype.getStartingFullmove=function() {
		return this._startingFullmove;
	}

	Variation.prototype.setStartingFullmove=function(fullmove) {
		this._startingFullmove=fullmove;
		//TODO clear the history
	}

	Variation.prototype.getStartingColour=function() {
		return this._startingColour;
	}

	Variation.prototype.setStartingColour=function(colour) {
		this._startingColour=colour;
		//TODO clear the history
	}

	Variation.prototype.getFirstMove=function() {
		//...
	}

	Variation.prototype.getLastMove=function() {
		//...
	}

	Variation.prototype.getBranchMove=function() {
		if(this.isMainline()) {
			return null;
		}

		else {
			//...
		}
	}

	Variation.prototype.insert=function(item, index) {
		var prevItem=this.moveList.item(index-1);
		var nextItem=this.moveList.item(index+1);

		if(prevItem!==null) {
			prevItem.setNextItem(item);
		}

		if(nextItem!==null) {
			nextItem.setPreviousItem(item);
		}

		item.setVariation(this);

		//FIXME make it so that moves can only ever be added at the end of variations (there is never a reason to add one in the middle somewhere - either it is overwriting or it is in a new variation)

		if(item.itemType===HistoryItem.MOVE) {
			var prevMove=item.getPreviousMove();
			var halfmove=Util.getHalfmove(this._startingFullmove, this._startingColour);

			if(prevMove!==null) {
				halfmove=prevMove.getHalfmove()+1;
			}

			else if(!this.isMainline()) {
				halfmove=this.getBranchMove().getHalfmove();
			}

			move.setHalfmove(halfmove);
		}

		item.setPreviousItem(prevItem);
		item.setNextItem(nextItem);

		this.moveList.insert(item, index);
	}

	Variation.prototype.remove=function(item) {
		var prevItem=item.getPreviousItem();
		var nextItem=item.getNextItem();

		if(prevItem!==null) {
			prevItem.setNextItem(nextItem);
		}

		if(nextItem!==null) {
			nextItem.setPreviousItem(prevItem);
		}

		this.moveList.remove(item);
	}

	Variation.prototype.deleteMove=function(move) {
		var item=move;

		while(item!==null) {
			this.remove(item);

			item=item.getNextItem();
		}
	}

	Variation.prototype.add=function(item) {
		this.insert(item, this.moveList.length);
	}

	Variation.prototype.insertAfter=function(item, prevItem) {
		if(prevItem===null) {
			this.insert(item, 0);
		}

		else {
			this.insert(item, this.moveList.indexOf(item)+1);
		}
	}

	/*
	insert an item after a move and all its variations
	*/

	Variation.prototype.insertAfterMove=function(item, previousMove) {
		if(prevMove===null) {
			this.insert(item, 0);
		}

		else {
			var prevItem=previousMove;

			while(prevItem.getNextVariation()!==null) {
				prevItem=prevItem.getNextVariation();
			}

			this.insertAfter(item, prevItem);
		}
	}

	Variation.prototype.isMainline=function() {
		return (this._variation===null);
	}

	Variation.prototype._createMoveList=function() {
		return new List();
	}

	return Variation;
});
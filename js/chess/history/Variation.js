define(function(require) {
	var List=require("lib/List");
	var HistoryItem=require("chess/history/HistoryItem");
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");

	function Class() {
		HistoryItem.call(this);

		this.itemType=HistoryItem.VARIATION;

		this._startingFullmove=1;
		this._startingColour=Piece.WHITE;

		this.moveList=this._createMoveList();
	}

	Class.implement(HistoryItem);

	Class.prototype.getStartingFullmove=function() {
		return this._startingFullmove;
	}

	Class.prototype.setStartingFullmove=function(fullmove) {
		this._startingFullmove=fullmove;
		//TODO clear the history
	}

	Class.prototype.getStartingColour=function() {
		return this._startingColour;
	}

	Class.prototype.setStartingColour=function(colour) {
		this._startingColour=colour;
		//TODO clear the history
	}

	Class.prototype.getFirstMove=function() {
		//...
	}

	Class.prototype.getLastMove=function() {
		//...
	}

	Class.prototype.getBranchMove=function() {
		if(this.isMainline()) {
			return null;
		}

		else {
			//...
		}
	}

	Class.prototype.insert=function(item, index) {
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

		item.setPreviousItem(prevItem);
		item.setNextItem(nextItem);

		this.moveList.insert(item, index);
	}

	Class.prototype.remove=function(item) {
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

	Class.prototype.deleteMove=function(move) {
		var item=move;

		while(item!==null) {
			this.remove(item);

			item=item.getNextItem();
		}
	}

	Class.prototype.add=function(item) {
		this.insert(item, this.moveList.length);
	}

	Class.prototype.insertAfter=function(item, prevItem) {
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

	Class.prototype.insertAfterMove=function(item, previousMove) {
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

	Class.prototype.isMainline=function() {
		return (this._variation===null);
	}

	Class.prototype._createMoveList=function() {
		return new List();
	}

	return Class;
});
define(function(require) {
	require("lib/Function.implement");
	var List=require("lib/List");
	var HistoryItem=require("chess/history/HistoryItem");
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");

	/*
	FIXME make the moveList a MoveList.  fuck indexes.  moveList.each should use
	the linked-list pointers internally.  then moveList.eachMove can be used to
	get only the moves as well.

	then .. fuck movelist altogether - it was only there to contain the moves.

	variation can act as the linked list.
	*/

	function Variation() {
		HistoryItem.call(this);

		this.itemType=HistoryItem.VARIATION;
		this.moveList=this._createMoveList();
	}

	Variation.implement(HistoryItem);

	Variation.prototype.getFirstMove=function() {
		return this.moveList.getFirstItem();
	}

	Variation.prototype.getLastMove=function() {
		var lastItem=this.moveList.getLastItem();
		var move=null;

		if(lastItem!==null) {
			if(lastItem.itemType===HistoryItem.VARIATION) {
				move=lastItem.getBranchMove();
			}

			else {
				move=lastItem;
			}
		}

		return move;
	}

	Variation.prototype.getBranchMove=function() {
		return this.getPreviousMove();
	}

	/*
	NOTE variations are chop-up able by the history.  they can be put in invalid states,
	e.g. adding a move somewhere that puts the fullmoves in the wrong sequence or makes
	it go two black moves consecutively.
	*/

	Variation.prototype.insert=function(item, index) {
		var prevItem=this.moveList.getItem(index-1);
		var nextItem=this.moveList.getItem(index+1);

		if(prevItem!==null) {
			prevItem.setNextItem(item);
		}

		if(nextItem!==null) {
			nextItem.setPreviousItem(item);
		}

		item.setVariation(this);

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
			//FIXME commenting stuff out to make it work.  this code will be removed anyway when there is no more MoveList
			//this.insert(item, this.moveList.indexOf(item)+1);
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
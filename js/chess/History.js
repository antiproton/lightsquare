function History() {
	this._startingColour=WHITE;
	this._startingFullmove=1;
	this.selectedMove=null;
	this.editMode=History.EDIT_MODE_BRANCH;
	this.mainLine=this.createVariation();

	/*
	bulkUpdate - set this to true before adding a lot of moves to
	the history

	things that handle the Moved/SelectedMoveChanged events can then check it
	to avoid doing things unnecessarily

	e.g. updating bughouse pieces available needs to get every move, but bringing
	the board up to date only needs to happen for the latest move
	*/

	this.bulkUpdate=false;

	//FIXME should probably be a method maybe like history.bulkUpdate(function() {...});

	this.SelectedMoveChanged=new Event(this);
	this.Moved=new Event(this);
	this.Update=new Event(this);
}

History.EDIT_MODE_FAIL=0;
History.EDIT_MODE_OVERWRITE=1;
History.EDIT_MODE_BRANCH=2;
History.EDIT_MODE_APPEND=3;

History.prototype.getStartingFullmove=function() {
	return this._startingFullmove;
}

History.prototype.setStartingFullmove=function(fullmove) {
	this._startingFullmove=fullmove;
	this.mainLine.setStartingFullmove(fullmove);
}

History.prototype.getStartingColour=function() {
	return this._startingColour;
}

History.prototype.setStartingColour=function(colour) {
	this._startingColour=colour;
	this.mainLine.setStartingColour(colour);
}

History.prototype.getMainLineWithoutVariations=function() {
	var variation=new Variation(this, true);

	this.mainLine.moveList.each(function(item) {
		if(!item.isVariation) {
			variation.add(item);
		}
	});

	return variation;
}

History.prototype.promoteCurrentVariation=function() {
	var variation=this.mainLine;
	var branchMove=null;
	var parentVar=null;

	if(this.selectedMove!==null) {
		variation=this.selectedMove.variation;
	}

	if(variation!=this.mainLine) {
		branchMove=variation.branchMove;
		parentVar=variation.variation;

		var item;
		var newVar=this._createVariation();

		//turn off auto-updating pointers and store the original settings to set back later

		var tempParent=parentVar.autoUpdatePointers;
		var tempNew=newVar.autoUpdatePointers;

		newVar.autoUpdatePointers=false;
		parentVar.autoUpdatePointers=false;

		//create a new variation and move the main line into it

		parentVar.remove(branchMove);
		newVar.add(branchMove);

		var item=branchMove.nextMove;

		while(item!==null) {
			parentVar.remove(item);
			newVar.add(item);
			item=item.nextItem;
		}

		//insert the first move of the promoted variation in the parent variation

		var prev_move=branchMove.previousMove;
		parentVar.insertAfterMove(variation.firstMove, prev_move);

		//insert the new variation at the end of the other variations in the main line

		item=branchMove;

		while(item.nextVariation!==null) {
			item=item.nextVariation;
		}

		parentVar.insertAfter(newVar, item);

		//insert the rest of the promoted variation (2nd move onwards) into the main line

		item=variation.firstMove.nextItem;

		while(item!==null) {
			parentVar.add(item);
			item=item.nextItem;
		}

		//delete the promoted variation (all the moves are now in the main line)

		parentVar.remove(variation);

		//set auto-updating pointers back to the original setting on each variation

		parentVar.autoUpdatePointers=tempParent;
		newVar.autoUpdatePointers=tempNew;

		parentVar.updatePointers(true);

		this.SelectedMoveChanged.fire({
			Move: this.selectedMove
		});
	}
}

History.prototype.deleteCurrentMove=function() {
	var move=this.selectedMove;
	var variation;
	var parentVar=null;

	if(move!==null) {
		variation=move.variation;
		parentVar=variation.variation;
		move.variation.deleteMove(move);

		if(variation.moveList.length===0 && !variation.IsMainline) {
			this.select(variation.branchMove);
			parentVar.remove(variation);
		}

		else {
			if(move.previousMove!==null) {
				this.select(move.previousMove);
			}

			else { //move was first of main line, the history is empty now
				this.deselect();
			}
		}
	}
}

History.prototype.move=function(move) {
	var success=true;
	var variation=this.mainLine;
	var currentMove=this.selectedMove;
	var nextMove=variation.firstMove;

	if(currentMove!==null) {
		variation=currentMove.variation;

		if(currentMove.nextMove!==null) {
			nextMove=currentMove.nextMove;
		}
	}

	if(variation.moveList.length===0 || currentMove===variation.lastMove) {
		variation.add(move);
	}

	else {
		switch(this.editMode) {
			case History.EDIT_MODE_APPEND: {
				variation.add(move);

				break;
			}

			case History.EDIT_MODE_FAIL: {
				success=false;

				break;
			}

			case History.EDIT_MODE_OVERWRITE: {
				variation.DeleteMove(nextMove);
				variation.add(move);

				break;
			}

			case History.EDIT_MODE_BRANCH: {
				var newVar=this._createVariation();

				variation.insertAfter(newVar, nextMove);
				newVar.add(move);

				break;
			}
		}
	}

	if(success) {
		this.Moved.fire({
			move: move
		});

		this.select(move);
	}

	return success;
}

History.prototype.clear=function() {
	if(this.mainLine.firstMove!==null) {
		this.mainLine.deleteMove(this.mainLine.firstMove);
	}

	this.deselect();
}

History.prototype.undo=function() {
	this.mainLine.remove(this.mainLine.lastMove);
	this.select(this.mainLine.lastMove);
}

History.prototype.select=function(move) {
	if(this.selectedMove!==null) {
		this.selectedMove.deselect();
	}

	this.selectedMove=move;

	if(move!==null) {
		move.select();
	}

	this.SelectedMoveChanged.fire({
		move: this.selectedMove
	});
}

History.prototype.deselect=function() {
	this.select(null);
}

History.prototype.createVariation=function() {
	return new Variation();
}

History.prototype.createMove=function() {
	return new Move();
}
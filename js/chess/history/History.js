define(function(require) {
	var Move=require("chess/history/Move");
	var Variation=require("chess/history/Variation");
	var Event=require("lib/Event");
	var Piece=require("chess/Piece");

	function History() {
		this.selectedMove=null;
		this.editMode=History.EDIT_MODE_BRANCH;
		this.mainLine=this.createVariation();

		this.SelectedMoveChanged=new Event(this);
		this.Moved=new Event(this);
		this.Update=new Event(this);
	}

	History.EDIT_MODE_FAIL=0;
	History.EDIT_MODE_OVERWRITE=1;
	History.EDIT_MODE_BRANCH=2;
	History.EDIT_MODE_APPEND=3;

	History.prototype.promoteCurrentVariation=function() {
		var variation=this.mainLine;
		var branchMove=null;
		var parentVariation=null;

		if(this.selectedMove!==null) {
			variation=this.selectedMove.getVariation();
		}

		if(variation!==this.mainLine) {
			branchMove=variation.getBranchMove();
			parentVariation=variation.getVariation();

			var item;
			var newVariation=this.createVariation();

			//create a new variation and move the main line into it

			parentVariation.remove(branchMove);
			newVariation.add(branchMove);

			var item=branchMove.getNextMove();

			while(item!==null) {
				parentVariation.remove(item);
				newVariation.add(item);
				item=item.nextItem;
			}

			//insert the first move of the promoted variation in the parent variation

			var prevMove=branchMove.getPreviousMove();
			parentVariation.insertAfterMove(variation.getFirstMove(), prevMove);

			//insert the new variation at the end of the other variations in the main line

			item=branchMove;

			while(item.nextVariation!==null) {
				item=item.nextVariation;
			}

			parentVariation.insertAfter(newVariation, item);

			//insert the rest of the promoted variation (2nd move onwards) into the parent variation

			item=variation.firstMove.getNextItem();

			while(item!==null) {
				parentVariation.add(item);
				item=item.getNextItem();
			}

			//delete the promoted variation (all the moves are now in the main line)

			parentVariation.remove(variation);

			this.SelectedMoveChanged.fire({
				move: this.selectedMove
			});
		}
	}

	History.prototype.deleteCurrentMove=function() {
		var move=this.selectedMove;
		var variation;
		var parentVariation=null;

		if(move!==null) {
			variation=move.variation;
			parentVariation=variation.variation;
			move.variation.deleteMove(move);

			if(variation.moveList.length===0 && !variation.IsMainline) {
				this.select(variation.branchMove);
				parentVariation.remove(variation);
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
		var nextMove=variation.getFirstMove();

		if(currentMove!==null) {
			variation=currentMove.getVariation();

			if(currentMove.getNextMove()!==null) {
				nextMove=currentMove.getNextMove();
			}
		}

		if(variation.moveList.length===0 || currentMove===variation.getLastMove()) {
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
					variation.deleteMove(nextMove);
					variation.add(move);

					break;
				}

				case History.EDIT_MODE_BRANCH: {
					var newVariation=this.createVariation();

					variation.insertAfter(newVariation, nextMove);
					newVariation.add(move);

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
			this.mainLine.deleteMove(this.mainLine.getFirstMove());
		}

		this.deselect();
	}

	History.prototype.undo=function() {
		this.mainLine.remove(this.mainLine.getLastMove());
		this.select(this.mainLine.getLastMove());
	}

	History.prototype.select=function(move) {
		this.selectedMove=move;

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

	History.prototype.createMove=function(move) {
		return new Move(move);
	}

	return History;
});
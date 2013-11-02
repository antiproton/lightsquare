function IHistoryCommon() {
	IEventHandlerLogging.implement(this);

	this.starting_colour=WHITE;
	this.starting_fullmove=1;
	this.SelectedMove=null;
	this.EditMode=IHistoryCommon.EDIT_MODE_BRANCH;
	this.MainLine=this.get_new_variation(true);

	/*
	BulkUpdate - set this to true before adding a lot of moves to
	the history

	things that handle the Moved/SelectedMoveChanged events can then check it
	to avoid doing things unnecessarily

	e.g. updating bughouse pieces available needs to get every move, but bringing
	the board up to date only needs to happen for the latest move
	*/
	
	this.BulkUpdate=false;

	this.StartingColour=new Property(this, function() {
		return this.starting_colour;
	}, function(value) {
		this.starting_colour=value;
		this.MainLine.UpdatePointers(true);
	});

	this.StartingFullmove=new Property(this, function() {
		return this.starting_fullmove;
	}, function(value) {
		this.starting_fullmove=value;
		this.MainLine.UpdatePointers(true);
	});

	this.MainLineNoVars=new Property(this, function() {
		var line=new Variation(this, true);

		this.MainLine.Line.Each(function(item) {
			if(!item.IsVariation) {
				line.Add(item);
			}
		});

		return line;
	});

	this.SelectedMoveChanged=new Event(this);
	this.Moved=new Event(this);
	this.Update=new Event(this);
}

IHistoryCommon.EDIT_MODE_FAIL=0;
IHistoryCommon.EDIT_MODE_OVERWRITE=1;
IHistoryCommon.EDIT_MODE_BRANCH=2;
IHistoryCommon.EDIT_MODE_APPEND=3;

IHistoryCommon.prototype.PromoteCurrentVariation=function() {
	var variation=this.MainLine;
	var branch_move=null;
	var parent_var=null;

	if(this.SelectedMove!==null) {
		variation=this.SelectedMove.Variation;
	}

	if(variation!=this.MainLine) {
		branch_move=variation.BranchMove;
		parent_var=variation.Variation;

		var item;
		var new_var=new this.cls_variation(this);

		//turn off auto-updating pointers and store the original settings to set back later

		var temp_parent=parent_var.AutoUpdatePointers;
		var temp_new=new_var.AutoUpdatePointers;

		new_var.AutoUpdatePointers=false;
		parent_var.AutoUpdatePointers=false;

		//create a new variation and move the main line into it

		parent_var.Remove(branch_move);
		new_var.Add(branch_move);

		var item=branch_move.NextMove;

		while(item!==null) {
			parent_var.Remove(item);
			new_var.Add(item);
			item=item.NextItem;
		}

		//insert the first move of the promoted variation in the parent variation

		var prev_move=branch_move.PreviousMove;
		parent_var.InsertAfterMove(variation.FirstMove, prev_move);

		//insert the new variation at the end of the other variations in the main line

		item=branch_move;

		while(item.NextVariation!==null) {
			item=item.NextVariation;
		}

		parent_var.InsertAfter(new_var, item);

		//insert the rest of the promoted variation (2nd move onwards) into the main line

		item=variation.FirstMove.NextItem;

		while(item!==null) {
			parent_var.Add(item);
			item=item.NextItem;
		}

		//delete the promoted variation (all the moves are now in the main line)

		parent_var.Remove(variation);

		//set auto-updating pointers back to the original setting on each variation

		parent_var.AutoUpdatePointers=temp_parent;
		new_var.AutoUpdatePointers=temp_new;

		parent_var.UpdatePointers(true);

		this.SelectedMoveChanged.Fire({Move: this.SelectedMove});
	}
}

IHistoryCommon.prototype.DeleteCurrentMove=function() {
	var move=this.SelectedMove;
	var variation=this.MainLine;
	var parent_var=null;

	if(move!==null) {
		variation=move.Variation;
		parent_var=variation.Variation;
		move.Variation.DeleteMove(move);

		if(variation.Line.Length==0 && !variation.IsMainline) {
			this.Select(variation.BranchMove);
			parent_var.Remove(variation); //NOTE - this is the only place that takes care of removing empty variations
		}

		else {
			if(move.PreviousMove!==null) {
				this.Select(move.PreviousMove);
			}

			else { //move was first of main line, the history is empty now
				this.Deselect(); //NOTE - anything that can delete the selected move needs to do this
			}
		}
	}
}

IHistoryCommon.prototype.Move=function(move) {
	var success=true;
	var variation=this.MainLine;
	var current_move=this.SelectedMove;
	var next_move=variation.FirstMove;

	if(current_move!==null) {
		variation=current_move.Variation;

		if(current_move.NextMove!==null) {
			next_move=current_move.NextMove;
		}
	}

	if(variation.Line.Length==0 || current_move==variation.LastMove) {
		variation.Add(move);
	}

	else {
		switch(this.EditMode) {
			case IHistoryCommon.EDIT_MODE_APPEND: {
				variation.Add(move);

				break;
			}

			case IHistoryCommon.EDIT_MODE_FAIL: {
				success=false;

				break;
			}

			case IHistoryCommon.EDIT_MODE_OVERWRITE: {
				variation.DeleteMove(next_move);
				variation.Add(move);

				break;
			}

			case IHistoryCommon.EDIT_MODE_BRANCH: {
				var new_var=this.get_new_variation();
				variation.InsertAfter(new_var, next_move);
				new_var.Add(move);

				break;
			}
		}
	}

	if(success) {
		this.Moved.Fire({Move: move});
		this.Select(move);
	}

	return success;
}

IHistoryCommon.prototype.Clear=function() {
	if(this.MainLine.FirstMove!==null) {
		this.MainLine.DeleteMove(this.MainLine.FirstMove);
	}

	this.Deselect();
}

IHistoryCommon.prototype.Undo=function() {
	this.MainLine.Remove(this.MainLine.LastMove);
	this.Select(this.MainLine.LastMove);
}

IHistoryCommon.prototype.Select=function(move) {
	this.deselect();
	this.SelectedMove=move;
	this.SelectedMoveChanged.Fire({Move: this.SelectedMove});
}

IHistoryCommon.prototype.deselect=function() {
	this.SelectedMove=null;
}

IHistoryCommon.prototype.Deselect=function() {
	this.Select(null);
}

IHistoryCommon.prototype.get_new_variation=function(is_mainline) {
	return new Variation(this, is_mainline);
}
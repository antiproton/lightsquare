function Variation(history, is_mainline) { //TODO hopefully is_mainline can be dropped at some point
	HistoryItem.implement(this);

	this.History=history;
	this.AutoUpdatePointers=true;
	this.IsMainline=!!is_mainline;
	this.IsVariation=true;
	this.MoveList=this.create_move_list();
	this.FirstMove=null;
	this.LastMove=null;
}

Variation.prototype.ResetPointers=function() {
	HistoryItem.prototype.ResetPointers.call(this);

	this.BranchMove=null; //the move before the first move of the variation
}

Variation.prototype.SetBranchMove=function(move) {
	this.BranchMove=move;
}

Variation.prototype.Insert=function(item, index, no_pointer_update) {
	var update_pointers=no_pointer_update?false:this.AutoUpdatePointers;

	this.MoveList.Insert(item, index);

	if(update_pointers) {
		this.UpdatePointers();
	}
}

Variation.prototype.Remove=function(item, no_pointer_update) {
	var update_pointers=no_pointer_update?false:this.AutoUpdatePointers;

	this.MoveList.Remove(item);

	if(update_pointers) {
		this.UpdatePointers();
	}
}

Variation.prototype.DeleteMove=function(move, no_pointer_update) {
	var update_pointers=no_pointer_update?false:this.AutoUpdatePointers;
	var item=move;

	while(item!==null) {
		this.Remove(item, true);
		item=item.NextItem;
	}

	if(update_pointers) {
		this.UpdatePointers();
	}
}

Variation.prototype.Add=function(item, no_pointer_update) {
	this.Insert(item, this.MoveList.Length, no_pointer_update);
}

Variation.prototype.InsertAfter=function(item, prev_item, no_pointer_update) {
	if(prev_item===null) {
		this.Insert(item, 0, no_pointer_update);
	}

	else {
		var i=0;

		this.MoveList.Each(function(item, index) {
			if(item==prev_item) {
				i=index;
			}
		});

		this.Insert(item, i+1, no_pointer_update);
	}
}

/*
InsertAfterMove - use this if the item should come after the move, or
after the move's last variation if it has any
*/

Variation.prototype.InsertAfterMove=function(item, prev_move, no_pointer_update) {
	if(prev_move===null) {
		this.Insert(item, 0, no_pointer_update);
	}

	else {
		var prev_item=prev_move;

		while(prev_item.NextVariation!==null) {
			prev_item=prev_item.NextVariation;
		}

		this.InsertAfter(item, prev_item, no_pointer_update);
	}
}

Variation.prototype.UpdatePointers=function(recursive) {
	this.FirstMove=null;
	this.LastMove=null;

	if(this.MoveList.Length>0) {
		var last_move=null;
		var previous_variation=null;
		var last_item=null;
		var move_index=0;
		var halfmove=Util.halfmove(this.History.StartingFullmove.Get());

		if(this.History.StartingColour.Get()===BLACK) {
			halfmove++;
		}

		if(!this.IsMainline) {
			halfmove=this.BranchMove.Halfmove;
		}

		this.FirstMove=this.Line.FirstItem();

		this.MoveList.Each(function(item, i) {
			item.ResetPointers();
			item.SetVariation(this);
			item.SetItemIndex(i);
			item.SetPreviousMove(last_move);
			item.SetPreviousItem(last_item);

			if(item.IsVariation) {
				item.SetBranchMove(last_move);

				if(recursive) {
					item.UpdatePointers(true);
				}

				if(last_item!==null) {
					last_item.SetNextVariation(item);
				}

				previous_variation=item;
			}

			else {
				this.LastMove=item;

				item.SetPreviousVariation(previous_variation);
				item.SetHalfmove(halfmove);
				item.SetMoveIndex(move_index);

				if(last_item!==null) {
					last_item.SetNextMove(item);
				}

				if(last_move!==null) {
					last_move.SetNextMove(item);
				}

				last_move=item;
				previous_variation=null;
				halfmove++;
				move_index++;
			}

			if(last_item!==null) {
				last_item.SetNextItem(item);
			}

			last_item=item;
		}, this);
	}
}

Variation.prototype.create_move_list=function() {
	return new List();
}
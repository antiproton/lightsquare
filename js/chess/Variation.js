function Variation(history, is_mainline) {
	this.History=history;
	this.AutoUpdatePointers=true;
	this.IsMainline=!!is_mainline;
	this.IsVariation=true; //for distinguishing between moves and variations in a move list
	this.Line=new List();
	this.FirstMove=null;
	this.LastMove=null;
	this.ResetPointers();
}

Variation.prototype.ResetPointers=function() {
	//general

	this.Variation=null;
	this.PreviousMove=null;
	this.NextMove=null;
	this.PreviousVariation=null;
	this.NextVariation=null;
	this.PreviousItem=null;
	this.NextItem=null;
	this.ItemIndex=null;

	//variation-specific

	this.BranchMove=null;
}

/*
Insert - anything that adds a move calls this
*/

Variation.prototype.Insert=function(item, index, dont_update) {
	var update=dont_update?false:this.AutoUpdatePointers;

	this.Line.Insert(item, index);

	if(update) {
		this.UpdatePointers();
	}
}

Variation.prototype.Remove=function(item, dont_update) {
	var update=dont_update?false:this.AutoUpdatePointers;

	this.Line.Remove(item);

	//NOTE variations that have become empty must be removed manually by calling code

	if(update) {
		this.UpdatePointers();
	}
}

Variation.prototype.DeleteMove=function(move, dont_update) {
	var update=dont_update?false:this.AutoUpdatePointers;
	var item=move;

	while(item!==null) {
		this.Remove(item, true);
		item=item.NextItem;
	}

	if(update) {
		this.UpdatePointers();
	}
}

Variation.prototype.Add=function(item, dont_update) {
	this.Insert(item, this.Line.Length, dont_update);
}

/*
insertafter/before - these don't rely on itemindexes as they
might be being called from code that has the pointers in an
invalid state.
*/

Variation.prototype.InsertAfter=function(item, prev_item, dont_update) {
	if(prev_item===null) {
		this.Insert(item, 0, dont_update);
	}

	else {
		var i=0;

		this.Line.Each(function(item, index) {
			if(item==prev_item) {
				i=index;
			}
		});

		this.Insert(item, i+1, dont_update);
	}
}

/*
InsertAfterMove - use this if the item should come after the move, or
after the move's last variation if it has any
*/

Variation.prototype.InsertAfterMove=function(item, prev_move, dont_update) {
	if(prev_move===null) {
		this.Insert(item, 0, dont_update);
	}

	else {
		var prev_item=prev_move;

		while(prev_item.NextVariation!==null) {
			prev_item=prev_item.NextVariation;
		}

		this.InsertAfter(item, prev_item, dont_update);
	}
}

/*
insertbefore doesn't seem to be needed

if next_item is null insert at 0
else insert at whatever index next_item is at
*/

Variation.prototype.UpdatePointers=function(recursive) {
	this.FirstMove=null;
	this.LastMove=null;

	if(this.Line.Length>0) {
		var last_move=null;
		var last_variation=null;
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

		this.Line.Each(function(item, i) {
			item.ResetPointers();
			item.Variation=this;
			item.ItemIndex=i;
			item.PreviousMove=last_move;
			item.PreviousItem=last_item;

			if(item.IsVariation) {
				item.BranchMove=last_move;

				if(recursive) {
					item.UpdatePointers(recursive);
				}

				if(last_item!==null) {
					last_item.NextVariation=item;
				}

				last_variation=item;
			}

			else {
				this.LastMove=item;
				item.PreviousVariation=last_variation;
				item.Halfmove=halfmove;
				item.Fullmove=Util.fullmove(halfmove);
				item.MoveIndex=move_index;
				item.Colour=Util.hm_colour(halfmove);
				item.Dot=Util.fullmove_dot(item.Colour);
				item.DisplayFullmove=(item.Colour==WHITE || item.MoveIndex==0 || last_variation!==null);

				if(last_item!==null) {
					last_item.NextMove=item;
				}

				if(last_move!==null) {
					last_move.NextMove=item;
				}

				last_move=item;
				last_variation=null; //this is meaningless if the last thing was a move, so set to null. (needed for the displayfullmove check)
				halfmove++;
				move_index++;
			}

			if(last_item!==null) {
				last_item.NextItem=item;
				last_item.PointersUpdated();
			}

			if(item==this.Line.LastItem()) {
				item.PointersUpdated(); //last iteration gets prev and current move
				//(if done on current move every time, .NextMove won't be set where there is a next move)
			}

			last_item=item;
		}, this);
	}
}
function UiMoveListColView() {
	this.Node=$("*div");

	List.implement(this);

	this.fullmoves=new List();
	this.current_fullmove=null;

	this.background_odd="#ffffff";
	this.background_even="#efefef";

	this.BackgroundOdd=new Property(this, function() {
		return this.background_odd;
	}, function(value) {
		this.background_odd=value;
		this.UpdateHtml();
	});

	this.BackgroundEven=new Property(this, function() {
		return this.background_even;
	}, function(value) {
		this.background_even=value;
		this.UpdateHtml();
	});
}

UiMoveListColView.prototype.SetupHtml=function() {
	this.UpdateHtml();
}

UiMoveListColView.prototype.UpdateHtml=function() {
	this.fullmoves.Each(function(item) {
		this.set_fullmove_background(item);
	}, this);
}

UiMoveListColView.prototype.set_fullmove_background=function(fullmove) {
	if(fullmove.Fullmove%2==0) {
		fullmove.BackgroundColour.Set(this.background_even);
	}

	else {
		fullmove.BackgroundColour.Set(this.background_odd);
	}
}

UiMoveListColView.prototype.Add=function(item) {
	/*
	this just adds it to the list now, inserting the html has to
	be completely after UpdatePointers in this one because it could
	be a white move or a black move
	*/

	List.prototype.Add.call(this, item);
}

UiMoveListColView.prototype.Insert=function(item) {
	/*
	more semantic nonce-sense - the variation does a lot of "inserting" into
	its line so this has to be kept, but there is no point having it behave
	like the other insert methods, so it just calls Add.
	*/

	this.Add(item);
}

/*
in the col view, the node isn't even inserted until after updatepointers

this is because it could be inserted into the left or right column, we
don't know until its Colour has been set to the proper value.
*/

UiMoveListColView.prototype.InsertHtml=function(move) {
	/*
	if no fullmove or the current fullmove is full
	*/

	if(this.current_fullmove===null || move.Colour===WHITE) {
		this.current_fullmove=this.fullmoves.Add(new Fullmove(this.Node, move.Fullmove));
		this.set_fullmove_background(this.current_fullmove);
	}

	this.current_fullmove.Add(move);
}

/*
FIXME make this the same as the textview one when that FIXME gets resolved
*/

UiMoveListColView.prototype.Remove=function(move) {
	List.prototype.Remove.call(this, move);

	var fullmove=move.ParentFullmove;

	fullmove.Remove(move);

	if(fullmove.IsEmpty()) {
		this.fullmoves.Remove(fullmove);
		Dom.RemoveNode(fullmove.Node);
	}

	if(this.fullmoves.Length>0) {
		this.current_fullmove=this.fullmoves.LastItem();
	}

	else {
		this.current_fullmove=null;
	}
}
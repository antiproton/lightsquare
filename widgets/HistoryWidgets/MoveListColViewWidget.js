function UiMoveListColView() {
	List.implement(this);

	this.tpl=new Template("movelist_colview");
	this.Node=this.tpl.root;
	this.fullmoves=new List();
	this.current_fullmove=null;
}

UiMoveListColView.prototype.Add=function(move) {
	List.prototype.Add.call(this, move);

	if(this.current_fullmove===null || move.Colour===WHITE) {
		this.current_fullmove=this.fullmoves.Add(new Fullmove(this.tpl.root, move.Fullmove));
	}

	this.current_fullmove.Add(move);
}

UiMoveListColView.prototype.Remove=function(move) {
	List.prototype.Remove.call(this, move);

	var fullmove=move.ParentFullmove;

	fullmove.Remove(move);

	if(fullmove.IsEmpty()) {
		this.fullmoves.Remove(fullmove);
		$(fullmove.Node).remove();
	}

	if(this.fullmoves.Length>0) {
		this.current_fullmove=this.fullmoves.LastItem();
	}

	else {
		this.current_fullmove=null;
	}
}
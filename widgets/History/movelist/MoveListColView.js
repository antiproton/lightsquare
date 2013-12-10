function MoveListColView() {
	List.implement(this);

	this._template=new Template("movelist_colview");
	this._fullmoves=new List();
	this.node=this._template.root;
}

MoveListColView.prototype.setStartingFullmove=function(fullmove) {
	this._startingFullmove=fullmove;
	this._updateFullmoves();
}

MoveListColView.prototype.insert=function(move) {
	this.add(move);
}

MoveListColView.prototype.add=function(move) {
	List.prototype.add.call(this, move);

	var lastFullmove=this._fullmoves.lastItem();

	if(lastFullmove===null || move.getColour()===WHITE) {
		lastFullmove=this._fullmoves.add(new Fullmove(this._template.root, move.getFullmove()));
	}

	lastFullmove.add(move);
}

MoveListColView.prototype.remove=function(move) {
	List.prototype.remove.call(this, move);

	var fullmove=move.getParentFullmove();

	fullmove.remove(move);

	if(fullmove.isEmpty()) {
		this._fullmoves.remove(fullmove);
		this._template.root.removeChild(fullmove.node);
	}
}
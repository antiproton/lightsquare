function MoveListColView() {
	List.implement(this);

	this._startingFullmove=1;
	this._currentFullmoveNo=1;
	this._template=new Template("movelist_colview");
	this.node=this._template.root;
	this.fullmoves=new List();
	this._currentFullmove=null;
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

	if(this._currentFullmove===null || move.colour===WHITE) {
		this._currentFullmove=this.fullmoves.add(new Fullmove(this._template.root, this._currentFullmoveNo++));
	}

	this._currentFullmove.add(move);
}

MoveListColView.prototype.remove=function(move) {
	List.prototype.remove.call(this, move);

	var fullmove=move.parentFullmove;

	fullmove.remove(move);

	if(fullmove.isEmpty()) {
		this.fullmoves.remove(fullmove);
		$(fullmove.node).remove();
	}

	if(this.fullmoves.length>0) {
		this._currentFullmove=this.fullmoves.lastItem();
	}

	else {
		this._currentFullmove=null;
	}
}

MoveListColView.prototype._updateFullmoves=function() {
	var fullmove=this._startingFullmove;

	this.fullmoves.each(function(item) {
		item.setFullmove(fullmove++);
	});
}
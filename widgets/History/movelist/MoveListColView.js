function MoveListColView() {
	List.implement(this);

	this.tpl=new Template("movelist_colview");
	this.node=this.tpl.root;
	this.fullmoves=new List();
	this._currentFullmove=null;
}

MoveListColView.prototype.add=function(move) {
	List.prototype.add.call(this, move);

	if(this._currentFullmove===null || move.colour===WHITE) {
		this._currentFullmove=this.fullmoves.add(new Fullmove(this.tpl.root, move.fullmove));
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
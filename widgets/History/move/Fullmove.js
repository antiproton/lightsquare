function Fullmove(parent, fullmove) {
	this._tpl=new Template("fullmove", parent);
	this._setupTemplate();

	this.fullmove=fullmove;

	this._isMoveAdded=[];
	this._isMoveAdded[WHITE]=false;
	this._isMoveAdded[BLACK]=false;

	this.isMoveAdded=new Property(this, function(colour) {
		return this._isMoveAdded[colour];
	});
}

Fullmove.prototype._setupTemplate=function() {
	this._colourCols=[];
	this._colourCols[WHITE]=this._tpl.white_col;
	this._colourCols[BLACK]=this._tpl.black_col;
}

Fullmove.prototype.add=function(move) {
	this._colourCols[move.colour].appendChild(move.node);
	move.parentFullmove=this;
	this._isMoveAdded[move.colour]=true;
}

Fullmove.prototype.remove=function(move) {
	$(move.node).remove();
	this._isMoveAdded[move.colour]=false;
}

Fullmove.prototype.isEmpty=function() {
	return (!this._isMoveAdded[WHITE] && !this._isMoveAdded[BLACK]);
}
function Fullmove(parent, fullmove) {
	this._tpl=new Template("fullmove", parent);
	this._setupTemplate();

	this.fullmove=fullmove;

	this._hasMove=[];
	this._hasMove[WHITE]=false;
	this._hasMove[BLACK]=false;

	this.isMoveAdded=setter(this, function(colour) {
		return this._hasMove[colour];
	});
}

Fullmove.prototype.setFullmove=function(fullmove) {
	this.fullmove=fullmove;
	this._fullmoveCol.innerHTML=fullmove;
}

Fullmove.prototype._setupTemplate=function() {
	this._fullmoveCol=this._tpl.fullmove_col;
	this._colourCols=[];
	this._colourCols[WHITE]=this._tpl.white_col;
	this._colourCols[BLACK]=this._tpl.black_col;
}

Fullmove.prototype.add=function(move) {
	this._colourCols[move.colour].appendChild(move.node);
	move.parentFullmove=this;
	this._hasMove[move.colour]=true;
}

Fullmove.prototype.remove=function(move) {
	$(move.node).remove();
	this._hasMove[move.colour]=false;
}

Fullmove.prototype.isEmpty=function() {
	return (!this._hasMove[WHITE] && !this._hasMove[BLACK]);
}
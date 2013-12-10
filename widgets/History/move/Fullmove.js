function Fullmove(parent) {
	this._template=new Template("fullmove", parent);
	this._setupTemplate();

	this._hasMove=[];
	this._hasMove[WHITE]=false;
	this._hasMove[BLACK]=false;

	this.isMoveAdded=setter(this, function(colour) {
		return this._hasMove[colour];
	});
}

Fullmove.prototype.setFullmove=function(fullmove) {
	this._fullmove=fullmove;
	this._updateFullmove();
}

Fullmove.prototype._updateFullmove=function() {
	this._fullmoveCol.innerHTML=fullmove;
}

Fullmove.prototype._setupTemplate=function() {
	this._fullmoveCol=this._template.fullmove_col;
	this._colourCols=[];
	this._colourCols[WHITE]=this._template.white_col;
	this._colourCols[BLACK]=this._template.black_col;
}

Fullmove.prototype.add=function(move, colour) {
	this._colourCols[colour].appendChild(move.node);
	move.parentFullmove=this;
	this._hasMove[colour]=true;
}

Fullmove.prototype.remove=function(move, colour) {
	$(move.node).remove();
	this._hasMove[colour]=false;
}

Fullmove.prototype.isEmpty=function() {
	return (!this._hasMove[WHITE] && !this._hasMove[BLACK]);
}
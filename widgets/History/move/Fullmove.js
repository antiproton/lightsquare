function Fullmove(parent, fullmove) {
	this._fullmove=fullmove;
	this._hasMove=[];
	this._hasMove[WHITE]=false;
	this._hasMove[BLACK]=false;

	this._template=new Template("fullmove", parent);
	this._setupTemplate();
}

Fullmove.prototype._setupTemplate=function() {
	this._fullmoveCol=this._template.fullmove_col;
	this._fullmoveCol.innerHTML=this._fullmove;
	this._colourCols=[];
	this._colourCols[WHITE]=this._template.white_col;
	this._colourCols[BLACK]=this._template.black_col;
}

Fullmove.prototype.add=function(move) {
	var colour=move.getColour();

	this._colourCols[colour].appendChild(move.node);
	this._hasMove[colour]=true;

	move.setParentFullmove(this);
}

Fullmove.prototype.remove=function(move) {
	var colour=move.getColour();

	this._colourCols[colour].removeNode(move.node);
	this._hasMove[colour]=false;
}

Fullmove.prototype.isEmpty=function() {
	return (!this._hasMove[WHITE] && !this._hasMove[BLACK]);
}
function Move() {
	HistoryItem.implement(this);

	this.itemType=HistoryItem.MOVE;

	this.engineBestMove=null; //best reply to this move e.g. "e8=Q#"
	this.engineScore=null; //eval result at this move e.g. 1.96 or number of moves to mate
	this.engineScoreType=null; //"cp" or "mate".  says what EngineScore means

	this._halfmove=null;
	this._isSelected=false;
	this._label="";

	this.isValid=false;
	this.isLegal=false;
	this.success=false;
	this.mtime=null;
	this.isCastling=false;
	this.capturedPiece=null;
	this.promoteTo=null;
	this.resultingFen=null;
	this.boardChanges=[];
	this.from=null;
	this.to=null;
	this.bughouseDropPiece=null;
}

Move.prototype.setLabel=function(label) {
	this._label=label;
}

Move.prototype.getHalfmove=function() {
	return this._halfmove;
}

Move.prototype.setHalfmove=function(halfmove) {
	this._halfmove=halfmove;
}

Move.prototype.getFullmove=function() {
	if(this._halfmove!==null) {
		return Util.fullmoveFromHalfmove(this._halfmove);
	}

	else {
		return null;
	}
}

Move.prototype.getColour=function() {
	if(this._halfmove!==null) {
		return Util.colourFromHalfmove(this._halfmove);
	}

	else {
		return null;
	}
}

Move.prototype.getDot=function() {
	if(this._halfmove!==null) {
		return Util.fullmoveDotFromColour(this.getColour());
	}

	else {
		return null;
	}
}

Move.prototype.getLabel=function() {
	return this._label;
}

Move.prototype.getFullLabel=function() {
	if(this._halfmove!==null) {
		return this.getFullmove()+this.getDot()+" "+this._label;
	}

	else {
		return null;
	}
}

Move.prototype.select=function() {
	this.isSelected=true;
}

Move.prototype.deselect=function() {
	this.isSelected=false;
}

Move.prototype.isSelected=function() {
	return this._isSelected;
}
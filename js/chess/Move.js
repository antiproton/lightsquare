function Move() {
	HistoryItem.implement(this);

	this.engineBestMove=null; //best reply to this move e.g. "e8=Q#"
	this.engineScore=null; //eval result at this move e.g. 1.96 or number of moves to mate
	this.engineScoreType=null; //"cp" or "mate".  says what EngineScore means

	this.isValid=false;
	this.isLegal=false;
	this.success=false; //whether the move has been applied successfully (this can be false for legal moves)
	this.mtime=null;

	this.isCastling=false;
	this.capturedPiece=null;
	this.promoteTo=null;
	this.resultingFen=null;
	this.boardChanges=[]; //list of objects that describe changes to apply to the board
	this.from=null;
	this.to=null;
	//TODO rename to from and to
	this.piece=null; //for bughouse moves
	this.isVariation=false; //for distinguishing between moves and variations in a move list
	this.label="";
	this.isSelected=false;
}

Move.prototype.getFullmove=function() {
	return Util.fullmove(this.halfmove);
}

Move.prototype.getColour=function() {
	return Util.colourFromHalfmove(this.halfmove);
}

Move.prototype.isFullmoveDisplayed=function() {
	return (this.getColour()===WHITE || this.moveIndex===0 || this.previousVariation!==null);
}

Move.prototype.getDot=function() {
	return Util.fullmove_dot(this.getColour());
}

Move.prototype.getFullLabel=function() {
	return this.getFullmove+this.getDot()+" "+this.label;
}

Move.prototype.resetPointers=function() {
	HistoryItem.prototype.resetPointers.call(this);

	this.halfmove=null; //e4 e5 (h5 Nc3) d4 //Nc3 is 2 (based on whole line starting from e4)
	this.moveIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 2 (variations are ignored).  Nc3 is 1 (based on variation line)
}

Move.prototype.setColour=function(colour) {
	this.colour=colour;
}

Move.prototype.setHalfmove=function(halfmove) {
	this.halfmove=halfmove;
}

Move.prototype.setMoveIndex=function(index) {
	this.moveIndex=index;
}

Move.prototype.setLabel=function(label) {
	this.label=label;
}

Move.prototype.select=function() {
	this.isSelected=true;
}

Move.prototype.deselect=function() {
	this.isSelected=false;
}
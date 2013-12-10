function Move() {
	HistoryItem.implement(this);

	this.engineBestMove=null; //best reply to this move e.g. "e8=Q#"
	this.engineScore=null; //eval result at this move e.g. 1.96 or number of moves to mate
	this.engineScoreType=null; //"cp" or "mate".  says what EngineScore means

	this.isValid=false;
	this.isLegal=false;
	this.success=false
	this.mtime=null;

	this._halfmove=null;
	this._moveIndex=null;
	this.isCastling=false;
	this.capturedPiece=null;
	this.promoteTo=null;
	this.resultingFen=null;
	this.boardChanges=[];
	this.from=null;
	this.to=null;
	this.bughouseDropPiece=null;
	this.isVariation=false;
	this.label=new MoveLabel();
	this.isSelected=false;
}

Move.prototype.getHalfmove=function() {
	return this._halfmove;
}

Move.prototype.getFullmove=function() {
	return Util.fullmove(this._halfmove);
}

Move.prototype.getColour=function() {
	return Util.colourFromHalfmove(this._halfmove);
}

Move.prototype.isFullmoveDisplayed=function() {
	return (this.getColour()===WHITE || this._moveIndex===0 || this.getPreviousVariation!==null);
}

Move.prototype.getDot=function() {
	return Util.fullmoveDotFromColour(this.getColour());
}

Move.prototype.getFullLabel=function() {
	return this.getFullmove()+this.getDot()+" "+this.label;
}

Move.prototype.resetPointers=function() {
	HistoryItem.prototype.resetPointers.call(this);

	this._halfmove=null; //e4 e5 (h5 Nc3) d4 //Nc3 is 2 (based on whole line starting from e4)
	this._moveIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 2 (variations are ignored).  Nc3 is 1 (based on variation line)
}

Move.prototype.setColour=function(colour) {
	this.colour=colour;
}

Move.prototype.setHalfmove=function(halfmove) {
	this._halfmove=halfmove;
}

Move.prototype.setMoveIndex=function(index) {
	this._moveIndex=index;
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
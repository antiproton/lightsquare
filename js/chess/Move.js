define(function(require) {
	var HistoryItem=require("./HistoryItem");
	var Chess=require("./Chess");

	/*
	widget Move

	- overrides getPositionAfter to return the position after from the db
	- calls this class in its constructor using a Position generated from
	the last move's positionafter or the game's starting fen.
	*/

	function Class(positionBefore, from, to) {
		HistoryItem.call(this);

		this._positionBefore=positionBefore;
		this._from=from;
		this._to=to;
		this._hasBeenChecked=false;
		this._positionAfter=null;

		this.itemType=HistoryItem.MOVE;

		this._halfmove=null;
		this._isSelected=false;
		this._label="";
		this._isValid=false;
		this._isLegal=false;
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

	Class.implement(HistoryItem);

	Class.prototype.check=function() {


		this._hasBeenChecked=true;
	}

	Class.prototype.isLegal=function() {
		if(this._hasBeenChecked) {
			return this._isLegal;
		}
	}

	Class.prototype.setPositionBefore=function(position) {
		this._positionBefore=position;
		this._hasBeenChecked=false;
	}

	Class.prototype.setFrom=function(from) {
		this._from=from;
		this._hasBeenChecked=false;
	}

	Class.prototype.setTo=function(to) {
		this._to=to;
		this._hasBeenChecked=false;
	}

	Class.prototype.setPositionAfter=function(position) {
		this._positionAfter=position;
		this._hasBeenChecked=false;
	}

	Class.prototype.setLabel=function(label) {
		this._label=label;
	}

	Class.prototype.getFullmove=function() {
		var fullmove=this._positionBefore.fullmove;

		if(this.getColour()===Piece.WHITE) {
			fullmove++;
		}

		return fullmove;
	}

	Class.prototype.getColour=function() {
		return this._positionBefore.active;
	}

	Class.prototype.getDot=function() {
		return Chess.fullmoveDotFromColour(this.getColour());
	}

	Class.prototype.getLabel=function() {
		return this._label;
	}

	Class.prototype.getFullLabel=function() {
		return this.getFullmove()+this.getDot()+" "+this._label;
	}

	Class.prototype.select=function() {
		this.isSelected=true;
	}

	Class.prototype.deselect=function() {
		this.isSelected=false;
	}

	Class.prototype.isSelected=function() {
		return this._isSelected;
	}

	return Class;
});
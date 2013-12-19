define(function(require) {
	var Chess=require("chess/Chess");

	function Class(positionBefore, from, to, promoteTo) {
		this._positionBefore=positionBefore;
		this._from=from;
		this._to=to;
		this._promoteTo=promoteTo||null;

		this._isCheck=false;
		this._isMate=false;
		this._isCastling=false;
		this._capturedPiece=null;
		this._isValid=false;
		this._isLegal=false;
		this._boardChanges=[];
		this._check();

	}

	Class.prototype._check=function() {

	}

	Class.prototype.isCheck=function() {
		return this._isCheck;
	}

	Class.prototype.isMate=function() {
		return this._isMate;
	}

	Class.prototype.isCastling=function() {
		return this._isCastling;
	}

	Class.prototype.isLegal=function() {
		return this._isLegal;
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
		var dot=[];

		dot[Piece.WHITE]=".";
		dot[Piece.BLACK]="...";

		return dot[this.getColour()];
	}

	Class.prototype.getLabel=function() {
		return this._label;
	}

	Class.prototype.getFullLabel=function() {
		return this.getFullmove()+this.getDot()+" "+this.getLabel();
	}

	return Class;
});
define(function(require) {
	var Piece=require("./Piece");

	function PiecesTaken() {
		this._pieces=[];
		this._pieces[Piece.WHITE]=[];
		this._pieces[Piece.BLACK]=[];
	}

	PiecesTaken.prototype.add=function(piece) {
		this._pieces[Piece.getColour(piece)].push(piece);
	}

	PiecesTaken.prototype.remove=function(piece) {
		var colour=Piece.getColour(piece);

		for(var i=0; i<this._pieces[colour].length; i++) {
			if(this._pieces[colour][i]===piece) {
				this._pieces[colour].splice(i, 1);

				break;
			}
		}
	}

	PiecesTaken.prototype.contains=function(piece) {
		var colour=Piece.getColour(piece);

		for(var i=0; i<this._pieces[colour].length; i++) {
			if(this._pieces[colour][i]===piece) {
				return true;
			}
		}

		return false;
	}

	PiecesTaken.prototype.clear=function() {
		this._pieces[Piece.WHITE]=[];
		this._pieces[Piece.BLACK]=[];
	}

	return PiecesTaken;
});
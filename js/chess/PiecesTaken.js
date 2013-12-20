define(function(require) {
	var Piece=require("chess/Piece");

	function Class() {
		this._pieces=[];
		this._pieces[Piece.WHITE]=[];
		this._pieces[Piece.BLACK]=[];
	}

	Class.prototype.add=function(piece) {
		this._pieces[Piece.getColour(piece)].push(piece);
	}

	Class.prototype.remove=function(piece) {
		var colour=Piece.getColour(piece);

		for(var i=0; i<this._pieces[colour].length; i++) {
			if(this._pieces[colour][i]===piece) {
				this._pieces[colour].splice(i, 1);

				break;
			}
		}
	}

	Class.prototype.contains=function(piece) {
		var colour=Piece.getColour(piece);

		for(var i=0; i<this._pieces[colour].length; i++) {
			if(this._pieces[colour][i]===piece) {
				return true;
			}
		}

		return false;
	}

	Class.prototype.clear=function() {
		this._pieces[Piece.WHITE]=[];
		this._pieces[Piece.BLACK]=[];
	}

	return Class;
});
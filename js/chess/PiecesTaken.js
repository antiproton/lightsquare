define(function(require) {
	var Util=require("./Util");
	
	function PiecesTaken() {
		this._pieces=[];
		this._pieces[WHITE]=[];
		this._pieces[BLACK]=[];
	}

	PiecesTaken.prototype.add=function(piece) {
		this._pieces[Util.getColour(piece)].push(piece);
	}

	PiecesTaken.prototype.remove=function(piece) {
		var colour=Util.getColour(piece);

		for(var i=0; i<this._pieces[colour].length; i++) {
			if(this._pieces[colour][i]===piece) {
				this._pieces[colour].splice(i, 1);

				break;
			}
		}
	}

	PiecesTaken.prototype.contains=function(piece) {
		var colour=Util.getColour(piece);

		for(var i=0; i<this._pieces[colour].length; i++) {
			if(this._pieces[colour][i]===piece) {
				return true;
			}
		}

		return false;
	}

	PiecesTaken.prototype.clear=function() {
		this._pieces[WHITE]=[];
		this._pieces[BLACK]=[];
	}

	return PiecesTaken;
});
function PiecesTaken() {
	this.pieces=[];
}

/*
Add - has to insert the piece in order for string checking on the server

NOTE doing it this way (looking at the piece's numerical value) depends
on the values (WHITE being 0 etc) because it's done differently but with
the same result on the server.

FIXME too coupled
*/

PiecesTaken.prototype.add=function(piece) {
	var nextLowest=-1;
	var currentPiece;

	for(var i=0; i<this.pieces.length; i++) {
		currentPiece=this.pieces[i];

		if(currentPiece<piece && currentPiece>nextLowest) {
			nextLowest=i;
		}
	}

	this.pieces.splice(nextLowest+1, 0, piece);
}

PiecesTaken.prototype.remove=function(piece) {
	for(var i=0; i<this.pieces.length; i++) {
		if(this.pieces[i]===piece) {
			this.pieces.splice(i, 1);

			break;
		}
	}
}

PiecesTaken.prototype.taken=function(piece) {
	for(var i=0; i<this.pieces.length; i++) {
		if(this.pieces[i]===piece) {
			return true;
		}
	}

	return false;
}

PiecesTaken.prototype.clear=function() {
	this.pieces=[];
}
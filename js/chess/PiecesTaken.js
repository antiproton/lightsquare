function PiecesTaken(parent) {
	this.pieces=[];
}

/*
Add - has to insert the piece in order for string checking on the server

NOTE doing it this way (looking at the piece's numerical value) depends
on the values (WHITE being 0 etc) because it's done differently but with
the same result on the server.
*/

PiecesTaken.prototype.Add=function(piece) {
	var next_lowest=-1;
	var current_piece;

	for(var i=0; i<this.pieces.length; i++) {
		current_piece=this.pieces[i];

		if(current_piece<piece && current_piece>next_lowest) {
			next_lowest=i;
		}
	}

	this.pieces.splice(next_lowest+1, 0, piece);
}

PiecesTaken.prototype.Remove=function(piece) {
	for(var i=0; i<this.pieces.length; i++) {
		if(this.pieces[i]===piece) {
			this.pieces.splice(i, 1);

			break;
		}
	}
}

PiecesTaken.prototype.Taken=function(piece) {
	for(var i=0; i<this.pieces.length; i++) {
		if(this.pieces[i]===piece) {
			return true;
		}
	}

	return false;
}

PiecesTaken.prototype.Clear=function() {
	this.pieces=[];
}
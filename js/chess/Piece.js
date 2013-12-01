function Piece(piece) {
	this.type=Util.type(piece);
	this.colour=Util.colour(piece);
}

Piece.values=[];

Piece.values[PAWN]=1;
Piece.values[KNIGHT]=3;
Piece.values[BISHOP]=3;
Piece.values[ROOK]=5;
Piece.values[QUEEN]=9;
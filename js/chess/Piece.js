function Piece(piece) {
	this.type=Util.getType(piece);
	this.colour=Util.getColour(piece);
}

Piece.values=[];

Piece.values[PAWN]=1;
Piece.values[KNIGHT]=3;
Piece.values[BISHOP]=3;
Piece.values[ROOK]=5;
Piece.values[QUEEN]=9;
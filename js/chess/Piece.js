function Piece(piece) {
	this.Type=Util.type(piece);
	this.Colour=Util.colour(piece);
}

Piece.Values=[];

Piece.Values[PAWN]=1;
Piece.Values[KNIGHT]=3;
Piece.Values[BISHOP]=3;
Piece.Values[ROOK]=5;
Piece.Values[QUEEN]=9;
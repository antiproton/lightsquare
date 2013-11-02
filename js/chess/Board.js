function Board() {
	this.Board=[];

	for(var i=0; i<64; i++) {
		this.Board.push(SQ_EMPTY);
	}

	this.Kings=[null, null];
}

Board.prototype.Move=function(from, to) {
	this.SetSquare(to, this.GetSquare(from));
	this.SetSquare(from, SQ_EMPTY);
}

Board.prototype.SetSquare=function(sq, pc) {
	this.Board[sq]=pc;

	if(Util.type(pc)==KING) {
		this.Kings[Util.colour(pc)]=sq;
	}
}

Board.prototype.GetSquare=function(sq) {
	return this.Board[sq];
}

Board.prototype.SetFen=function(fen) {
	var fields=Fen.fen_to_array(fen);
	this.Board=Fen.pos_to_array(fields[FEN_FIELD_POSITION]);
}

Board.prototype.SetBoard=function(board) {
	for(var sq=0; sq<64; sq++) {
		this.SetSquare(sq, board[sq]);
	}
}

Board.prototype.Copy=function(board) {
	for(var sq=0; sq<64; sq++) {
		this.SetSquare(sq, board.GetSquare(sq));
	}
}
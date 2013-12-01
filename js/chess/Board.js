function Board() {
	this.board=[];

	for(var i=0; i<64; i++) {
		this.board.push(SQ_EMPTY);
	}

	this.kings=[null, null];
}

Board.prototype.move=function(from, to) {
	this.setSquare(to, this.getSquare(from));
	this.setSquare(from, SQ_EMPTY);
}

Board.prototype.sSetSquare=function(sq, pc) {
	this.board[sq]=pc;

	if(Util.type(pc)===KING) {
		this.kings[Util.colour(pc)]=sq;
	}
}

Board.prototype.getSquare=function(sq) {
	return this.board[sq];
}

Board.prototype.setFen=function(fen) {
	var fields=Fen.fenToArray(fen);

	this.board=Fen.posToArray(fields[FEN_FIELD_POSITION]);
}

Board.prototype.setBoard=function(board) {
	for(var sq=0; sq<64; sq++) {
		this.setSquare(sq, board[sq]);
	}
}

Board.prototype.copy=function(board) {
	for(var sq=0; sq<64; sq++) {
		this.setSquare(sq, board.getSquare(sq));
	}
}
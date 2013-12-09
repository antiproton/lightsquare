function Board() {
	this.board=[];

	for(var i=0; i<64; i++) {
		this.board.push(SQ_EMPTY);
	}

	this.kingPositions=[]
	this.kingPositions[WHITE]=null;
	this.kingPositions[BLACK]=null;
}

Board.prototype.move=function(from, to) {
	this.setSquare(to, this.getSquare(from));
	this.setSquare(from, SQ_EMPTY);
}

Board.prototype.setSquare=function(square, piece) {
	this.board[square]=piece;

	if(Util.getType(piece)===KING) {
		this.kingPositions[Util.getColour(piece)]=square;
	}
}

Board.prototype.getSquare=function(square) {
	return this.board[square];
}

Board.prototype.setBoard=function(board) {
	for(var square=0; square<64; square++) {
		this.setSquare(square, board[square]);
	}
}

Board.prototype.copy=function(board) {
	for(var square=0; square<64; square++) {
		this.setSquare(square, board.getSquare(square));
	}
}
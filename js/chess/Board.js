function Board() {
	this._board=[];

	for(var i=0; i<64; i++) {
		this._board.push(SQ_EMPTY);
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
	this._board[square]=piece;

	if(Util.getType(piece)===KING) {
		this.kingPositions[Util.getColour(piece)]=square;
	}
}

Board.prototype.getSquare=function(square) {
	return this._board[square];
}

Board.prototype.setBoardArray=function(board) {
	for(var square=0; square<64; square++) {
		this.setSquare(square, board[square]);
	}
}

Board.prototype.getBoardArray=function() {
	return this._board;
}

Board.prototype.copy=function(board) {
	var board=new this.constructor();

	board.setBoardArray(this.getBoardArray());
}
function Position(fen) {
	this.castlingRights=new CastlingRights();
	this.board=[];
	this.kingPositions=[];
	this.active=WHITE;
	this.epTarget=null;
	this.fiftymoveClock=0;
	this.fullmove=1;

	if(fen) {
		this.setFen(fen);
	}

	else {
		this.setFen(FEN_INITIAL);
	}
}

Position.prototype.setSquare=function(square, piece) {
	this.board[square]=piece;

	if(Util.type(piece)===KING) {
		this.kingPositions[Util.getColour(piece)]=square;
	}
}

Position.prototype.setFen=function(str) {
	var fen=Fen.fenToArray(str);

	this.active=Colour.getCode(fen[FEN_FIELD_ACTIVE]);
	this.castlingRights.setFenString(fen[FEN_FIELD_CASTLING]);

	if(fen[FEN_FIELD_EP]===FEN_NONE) {
		this.epTarget=null;
	}

	else {
		this.epTarget=Util.squareFromAlgebraic(fen[FEN_FIELD_EP]);
	}

	this.fiftymoveClock=0;

	if(fen[FEN_FIELD_CLOCK]) {
		this.fiftymoveClock=parseInt(fen[FEN_FIELD_CLOCK]);
	}

	this.fullmove=1;

	if(fen[FEN_FIELD_FULLMOVE]) {
		this.fullmove=parseInt(fen[FEN_FIELD_FULLMOVE]);
	}

	var board=Fen.fenPositionToArray(fen[FEN_FIELD_POSITION]);

	for(var square=0; square<64; square++) {
		this.setSquare(square, board[square]);
	}
}

Position.prototype.getFen=function() {
	return Fen.arrayToFen([
		Fen.arrayToFenPosition(this.board),
		Colour.getFen(this.active),
		this.castlingRights.getFenString(),
		(this.epTarget===null)?FEN_NONE:Util.algebraicFromSquare(this.epTarget),
		this.fiftymoveClock.toString(),
		this.fullmove.toString()
	]);
}
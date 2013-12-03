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
		this.kingPositions[Util.colour(piece)]=square;
	}
}

Position.prototype.setFen=function(str) {
	var fen=Fen.fenToArray(str);

	this.active=Fen.colour_int(fen[FEN_FIELD_ACTIVE]);
	this.castlingRights.setStr(fen[FEN_FIELD_CASTLING]);

	this.epTarget=(fen[FEN_FIELD_EP]===FEN_NONE)?null:Util.sq(fen[FEN_FIELD_EP]);

	this.fiftymoveClock=0;

	if(fen[FEN_FIELD_CLOCK]) {
		this.fiftymoveClock=parseInt(fen[FEN_FIELD_CLOCK]);
	}

	this.fullmove=1;

	if(fen[FEN_FIELD_FULLMOVE]) {
		this.fullmove=parseInt(fen[FEN_FIELD_FULLMOVE]);
	}

	var board=Fen.pos_to_array(fen[FEN_FIELD_POSITION]);

	for(var sq=0; sq<board.length; sq++) {
		this.setSquare(sq, board[sq]);
	}
}

Position.prototype.getFen=function() {
	return Fen.arrayToFen([
		Fen.arrayToPos(this.board),
		Fen.colourStr(this.active),
		this.castlingRights.getStr(),
		(this.epTarget===null)?FEN_NONE:Util.alg_sq(this.epTarget),
		this.fiftymoveClock.toString(),
		this.fullmove.toString()
	]);
}
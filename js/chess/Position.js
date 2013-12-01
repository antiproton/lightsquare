function Position(fen) {
	fen=fen||null;

	this.castling=new CastlingPrivileges();
	this.board=[];
	this.kings=[];
	this.active=WHITE;
	this.ep=null;
	this.clock=0;
	this.fullmove=1;

	if(fen===null) {
		this.setFen(FEN_INITIAL);
	}

	else {
		this.setFen(fen);
	}
}

Position.prototype.setSquare=function(sq, pc) {
	this.board[sq]=pc;

	if(Util.type(pc)===KING) {
		this.kings[Util.colour(pc)]=sq;
	}
}

Position.prototype.setFen=function(str) {
	var fen=Fen.fenToArray(str);

	this.active=Fen.colour_int(fen[FEN_FIELD_ACTIVE]);
	this.castling.setStr(fen[FEN_FIELD_CASTLING]);
	this.ep=(fen[FEN_FIELD_EP]===FEN_NONE)?null:Util.sq(fen[FEN_FIELD_EP]);
	this.clock=0;

	if(fen[FEN_FIELD_CLOCK]) {
		this.clock=parseInt(fen[FEN_FIELD_CLOCK]);
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
		this.castling.getStr(),
		(this.ep===null)?FEN_NONE:Util.alg_sq(this.ep),
		this.clock.toString(),
		this.fullmove.toString()
	]);
}
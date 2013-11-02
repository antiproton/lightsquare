function Position(fen) {
	fen=fen||null;

	this.Castling=new CastlingPrivileges();
	this.Board=[];
	this.Kings=[];
	this.Active=WHITE;
	this.Ep=null;
	this.Clock=0;
	this.Fullmove=1;

	if(fen===null) {
		this.SetFen(FEN_INITIAL);
	}

	else {
		this.SetFen(fen);
	}
}

Position.prototype.SetSquare=function(sq, pc) {
	this.Board[sq]=pc;

	if(Util.type(pc)===KING) {
		this.Kings[Util.colour(pc)]=sq;
	}
}

Position.prototype.SetFen=function(str) {
	var fen=Fen.fen_to_array(str);

	this.Active=Fen.colour_int(fen[FEN_FIELD_ACTIVE]);
	this.Castling.SetStr(fen[FEN_FIELD_CASTLING]);
	this.Ep=(fen[FEN_FIELD_EP]===FEN_NONE)?null:Util.sq(fen[FEN_FIELD_EP]);
	this.Clock=0;

	if(fen[FEN_FIELD_CLOCK]) {
		this.Clock=parseInt(fen[FEN_FIELD_CLOCK]);
	}

	this.Fullmove=1;

	if(fen[FEN_FIELD_FULLMOVE]) {
		this.Fullmove=parseInt(fen[FEN_FIELD_FULLMOVE]);
	}

	var board=Fen.pos_to_array(fen[FEN_FIELD_POSITION]);

	for(var sq=0; sq<board.length; sq++) {
		this.SetSquare(sq, board[sq]);
	}
}

Position.prototype.GetFen=function() {
	return Fen.array_to_fen([
		Fen.array_to_pos(this.Board),
		Fen.colour_str(this.Active),
		this.Castling.GetStr(),
		(this.Ep===null)?FEN_NONE:Util.alg_sq(this.Ep),
		this.Clock.toString(),
		this.Fullmove.toString()
	]);
}
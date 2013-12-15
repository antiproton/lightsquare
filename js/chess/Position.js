define(function(require) {
	var Fen=require("./Fen");
	var CastlingRights=require("./CastlingRights");
	var Board=require("./Board");
	var Colour=require("./Colour");
	
	function Position(fen) {
		this.castlingRights=new CastlingRights();
		this.board=new Board();
		this.active=WHITE;
		this.epTarget=null;
		this.fiftymoveClock=0;
		this.fullmove=1;

		if(fen) {
			this.setFen(fen);
		}

		else {
			this.setFen(Fen.STARTING_FEN);
		}
	}

	Position.prototype.setFen=function(str) {
		var fen=Fen.fenToArray(str);

		this.active=Colour.getCode(fen[Fen.FIELD_ACTIVE]);
		this.castlingRights.setFenString(fen[Fen.FIELD_CASTLING]);

		if(fen[Fen.FIELD_EP]===Fen.NONE) {
			this.epTarget=null;
		}

		else {
			this.epTarget=Util.squareFromAlgebraic(fen[Fen.FIELD_EP]);
		}

		this.fiftymoveClock=0;

		if(fen[Fen.FIELD_CLOCK]) {
			this.fiftymoveClock=parseInt(fen[Fen.FIELD_CLOCK]);
		}

		this.fullmove=1;

		if(fen[Fen.FIELD_FULLMOVE]) {
			this.fullmove=parseInt(fen[Fen.FIELD_FULLMOVE]);
		}

		var boardArray=Fen.fenPositionToBoardArray(fen[Fen.FIELD_POSITION]);

		for(var square=0; square<64; square++) {
			this.board.setSquare(square, boardArray[square]);
		}
	}

	Position.prototype.getFen=function() {
		return Fen.arrayToFen([
			Fen.boardArrayToFenPosition(this.board.board),
			Colour.getFen(this.active),
			this.castlingRights.getFenString(),
			(this.epTarget===null)?Fen.NONE:Util.algebraicFromSquare(this.epTarget),
			this.fiftymoveClock.toString(),
			this.fullmove.toString()
		]);
	}

	Position.prototype.copy=function() {
		return new Position(this.getFen());
	}

	return Position;
});
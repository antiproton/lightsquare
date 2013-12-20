define(function(require) {
	var Fen=require("chess/Fen");
	var CastlingRights=require("chess/CastlingRights");
	var Board=require("chess/Board");
	var Colour=require("chess/Colour");
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");

	function Class(fen) {
		this.castlingRights=new CastlingRights();
		this.board=new Board();
		this.active=Piece.WHITE;
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

	Class.prototype.setFen=function(str) {
		var fen=Fen.fenToArray(str);

		this.active=Colour.getCode(fen[Fen.FIELD_ACTIVE]);
		this.castlingRights.setFenString(fen[Fen.FIELD_CASTLING]);

		if(fen[Fen.FIELD_EP]===Fen.NONE) {
			this.epTarget=null;
		}

		else {
			this.epTarget=Chess.squareFromAlgebraic(fen[Fen.FIELD_EP]);
		}

		this.fiftymoveClock=0;

		if(fen[Fen.FIELD_CLOCK]) {
			this.fiftymoveClock=parseInt(fen[Fen.FIELD_CLOCK]);
		}

		this.fullmove=1;

		if(fen[Fen.FIELD_FULLMOVE]) {
			this.fullmove=parseInt(fen[Fen.FIELD_FULLMOVE]);
		}

		this.board.setBoardArray(Fen.fenPositionToBoardArray(fen[Fen.FIELD_POSITION]));
	}

	Class.prototype.getFen=function() {
		return Fen.arrayToFen([
			Fen.boardArrayToFenPosition(this.board.getBoardArray()),
			Colour.getFen(this.active),
			this.castlingRights.getFenString(),
			(this.epTarget===null)?Fen.NONE:Chess.algebraicFromSquare(this.epTarget), //FIXME should be Square.getAlgebraic or something.  Number.prototype.toAlgebraic is tempting also.
			this.fiftymoveClock.toString(),
			this.fullmove.toString()
		]);
	}

	Class.prototype.copy=function() {
		return new Class(this.getFen());
	}

	return Class;
});
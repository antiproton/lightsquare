define(function(require) {
	function Piece(piece) {
		this.type = Piece.getType(piece);
		this.colour = Piece.getColour(piece);
	}

	Piece.prototype.valueOf = function() {
		return Piece.getPiece(this.type, this.colour);
	}

	Piece.getType = function(piece) {
		return piece & Piece._BITWISE_TYPE;
	}

	Piece.getColour = function(piece) {
		return piece >> Piece._BITWISE_COLOUR;
	}

	Piece.getPiece = function(type, colour) {
		return (colour << Piece._BITWISE_COLOUR) | type;
	}

	Piece.WHITE = 0;
	Piece.BLACK = 1;

	Piece.NONE = 0x0;

	Piece.PAWN = 0x1;
	Piece.KNIGHT = 0x2;
	Piece.BISHOP = 0x3;
	Piece.ROOK = 0x4;
	Piece.QUEEN = 0x5;
	Piece.KING = 0x6;

	Piece.WHITE_PAWN = 0x1;
	Piece.WHITE_KNIGHT = 0x2;
	Piece.WHITE_BISHOP = 0x3;
	Piece.WHITE_ROOK = 0x4;
	Piece.WHITE_QUEEN = 0x5;
	Piece.WHITE_KING = 0x6;

	Piece.BLACK_PAWN = 0x9;
	Piece.BLACK_KNIGHT = 0xA;
	Piece.BLACK_BISHOP = 0xB;
	Piece.BLACK_ROOK = 0xC;
	Piece.BLACK_QUEEN = 0xD;
	Piece.BLACK_KING = 0xE;

	Piece._BITWISE_TYPE = ~8;
	Piece._BITWISE_COLOUR = 3;

	Piece.values = [];

	Piece.values[Piece.PAWN] = 1;
	Piece.values[Piece.KNIGHT] = 3;
	Piece.values[Piece.BISHOP] = 3;
	Piece.values[Piece.ROOK] = 5;
	Piece.values[Piece.QUEEN] = 9;

	return Piece;
});
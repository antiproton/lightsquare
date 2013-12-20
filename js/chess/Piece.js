define(function(require) {
	function Class(piece) {
		this.type=Class.getType(piece);
		this.colour=Class.getColour(piece);
	}

	Class.prototype.valueOf=function() {
		return Class.getPiece(this.type, this.colour);
	}

	Class.getType=function(piece) {
		return piece&Class._BITWISE_TYPE;
	}

	Class.getColour=function(piece) {
		return piece>>Class._BITWISE_COLOUR;
	}

	Class.getPiece=function(type, colour) {
		return (colour<<Class._BITWISE_COLOUR)|type;
	}

	Class.WHITE=0;
	Class.BLACK=1;

	Class.NONE=0x0;

	Class.PAWN=0x1;
	Class.KNIGHT=0x2;
	Class.BISHOP=0x3;
	Class.ROOK=0x4;
	Class.QUEEN=0x5;
	Class.KING=0x6;

	Class.WHITE_PAWN=0x1;
	Class.WHITE_KNIGHT=0x2;
	Class.WHITE_BISHOP=0x3;
	Class.WHITE_ROOK=0x4;
	Class.WHITE_QUEEN=0x5;
	Class.WHITE_KING=0x6;

	Class.BLACK_PAWN=0x9;
	Class.BLACK_KNIGHT=0xA;
	Class.BLACK_BISHOP=0xB;
	Class.BLACK_ROOK=0xC;
	Class.BLACK_QUEEN=0xD;
	Class.BLACK_KING=0xE;

	Class._BITWISE_TYPE=~8;
	Class._BITWISE_COLOUR=3;

	Class.values=[];

	Class.values[Class.PAWN]=1;
	Class.values[Class.KNIGHT]=3;
	Class.values[Class.BISHOP]=3;
	Class.values[Class.ROOK]=5;
	Class.values[Class.QUEEN]=9;

	return Class;
});
var Fen={
	INITIAL: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	NONE: "-",
	ACTIVE_WHITE: "w",
	ACTIVE_BLACK:" b",

	_FIELD_SEPARATOR: " ",
	_RANK_SEPARATOR: "/",

	FIELD_POSITION: 0,
	FIELD_ACTIVE: 1,
	FIELD_CASTLING: 2,
	FIELD_EP: 3,
	FIELD_CLOCK: 4,
	FIELD_FULLMOVE: 5,

	WHITE_CASTLE_KS: "K",
	WHITE_CASTLE_QS: "Q",
	BLACK_CASTLE_KS: "k",
	BLACK_CASTLE_QS: "q",

	WHITE_CASTLE_A: "A",
	WHITE_CASTLE_B: "B",
	WHITE_CASTLE_C: "C",
	WHITE_CASTLE_D: "D",
	WHITE_CASTLE_E: "E",
	WHITE_CASTLE_F: "F",
	WHITE_CASTLE_G: "G",
	WHITE_CASTLE_H: "H",
	BLACK_CASTLE_A: "a",
	BLACK_CASTLE_B: "b",
	BLACK_CASTLE_C: "c",
	BLACK_CASTLE_D: "d",
	BLACK_CASTLE_E: "e",
	BLACK_CASTLE_F: "f",
	BLACK_CASTLE_G: "g",
	BLACK_CASTLE_H: "h",

	getPieceCode: function(piece) {
		return Fen._pieceCodes[piece];
	},

	getPieceChar: function(piece) {
		return Fen._pieceChars[piece];
	},

	fenPositionToBoard: function(fenPosition) {
		var board=[];
		var ranks=fenPosition.split(Fen._RANK_SEPARATOR).reverse();
		var rank, ch;

		for(i=0; i<8; i++) {
			rank=ranks[i].split("");

			for(var j=0; j<rank.length; j++) {
				ch=rank[j];

				if(ch in Fen._pieceCodes) {
					board.push(Fen.getPieceCode(ch));
				}

				else {
					for(var k=0; k<parseInt(ch); k++) {
						board.push(SQ_EMPTY);
					}
				}
			}
		}

		return board;
	},

	boardToFenPosition: function(board) {
		var fenRanks=[];
		var ranks=[];

		for(var i=56; i>-1; i-=8) {
			ranks.push(board.slice(i, i+8));
		}

		var fenRank;
		var piece;
		var emptySquares;

		for(var i=0; i<8; i++) {
			emptySquares=0;
			fenRank="";

			for(var j=0; j<8; j++) {
				piece=ranks[i][j];

				if(piece===SQ_EMPTY) {
					emptySquares++;
				}

				if(emptySquares>0 && (piece!==SQ_EMPTY || j===7)) {
					fenRank+=emptySquares;
					emptySquares=0;
				}

				if(piece!==SQ_EMPTY) {
					fenRank+=Fen.getPieceChar(piece);
				}
			}

			fenRanks.push(fenRank);
		}

		return fenRanks.join(Fen._RANK_SEPARATOR);
	},

	fenToArray: function(fen) {
		return fen.split(Fen._FIELD_SEPARATOR);
	},

	arrayToFen: function(array) {
		return array.join(Fen._FIELD_SEPARATOR);
	}
};

Fen._pieceChars=[];
Fen._pieceChars[WHITE_PAWN]="P";
Fen._pieceChars[WHITE_KNIGHT]="N";
Fen._pieceChars[WHITE_BISHOP]="B";
Fen._pieceChars[WHITE_ROOK]="R";
Fen._pieceChars[WHITE_QUEEN]="Q";
Fen._pieceChars[WHITE_KING]="K";
Fen._pieceChars[BLACK_PAWN]="p";
Fen._pieceChars[BLACK_KNIGHT]="n";
Fen._pieceChars[BLACK_BISHOP]="b";
Fen._pieceChars[BLACK_ROOK]="r";
Fen._pieceChars[BLACK_QUEEN]="q";
Fen._pieceChars[BLACK_KING]="k";

Fen._pieceCodes={
	"P": WHITE_PAWN,
	"N": WHITE_KNIGHT,
	"B": WHITE_BISHOP,
	"R": WHITE_ROOK,
	"Q": WHITE_QUEEN,
	"K": WHITE_KING,
	"p": BLACK_PAWN,
	"n": BLACK_KNIGHT,
	"b": BLACK_BISHOP,
	"r": BLACK_ROOK,
	"q": BLACK_QUEEN,
	"k": BLACK_KING
};
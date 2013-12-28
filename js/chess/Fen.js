define(function(require) {
	var Piece=require("chess/Piece");

	function Fen(fenString) {
		fenString=fenString||Fen.STARTING_FEN;

		var array=fenString.split(/\s+/);

		this.position=array[0];
		this.active=array[1];
		this.castlingRights=array[2];
		this.epTarget=array[3];
		this.fiftymoveClock="0";
		this.fullmove="1";

		if(array.length>4) {
			this.fiftymoveClock=array[4];
		}

		if(array.length>5) {
			this.fullmove=array[5];
		}
	}

	Fen.prototype.toString=function() {
		return [
			this.position,
			this.active,
			this.castlingRights,
			this.epTarget,
			this.fiftymoveClock,
			this.fullmove
		].join(" ");
	}

	Fen.STARTING_FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	Fen.NONE="-";
	Fen.ACTIVE_WHITE="w";
	Fen.ACTIVE_BLACK="b";
	Fen.WHITE_CASTLE_KS="K";
	Fen.WHITE_CASTLE_QS="Q";
	Fen.BLACK_CASTLE_KS="k";
	Fen.BLACK_CASTLE_QS="q";

	Fen.getPieceCode=function(piece) {
		return Fen._pieceCodes[piece];
	}

	Fen.getPieceChar=function(piece) {
		return Fen._pieceChars[piece];
	}

	Fen.boardArrayFromFenPosition=function(fenPosition) {
		var board=[];
		var ranks=fenPosition.split("/").reverse();
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
						board.push(Piece.NONE);
					}
				}
			}
		}

		return board;
	}

	Fen.fenPositionFromBoardArray=function(board) {
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

				if(piece===Piece.NONE) {
					emptySquares++;
				}

				if(emptySquares>0 && (piece!==Piece.NONE || j===7)) {
					fenRank+=emptySquares;
					emptySquares=0;
				}

				if(piece!==Piece.NONE) {
					fenRank+=Fen.getPieceChar(piece);
				}
			}

			fenRanks.push(fenRank);
		}

		return fenRanks.join("/");
	}

	Fen._pieceChars=[];
	Fen._pieceChars[Piece.WHITE_PAWN]="P";
	Fen._pieceChars[Piece.WHITE_KNIGHT]="N";
	Fen._pieceChars[Piece.WHITE_BISHOP]="B";
	Fen._pieceChars[Piece.WHITE_ROOK]="R";
	Fen._pieceChars[Piece.WHITE_QUEEN]="Q";
	Fen._pieceChars[Piece.WHITE_KING]="K";
	Fen._pieceChars[Piece.BLACK_PAWN]="p";
	Fen._pieceChars[Piece.BLACK_KNIGHT]="n";
	Fen._pieceChars[Piece.BLACK_BISHOP]="b";
	Fen._pieceChars[Piece.BLACK_ROOK]="r";
	Fen._pieceChars[Piece.BLACK_QUEEN]="q";
	Fen._pieceChars[Piece.BLACK_KING]="k";

	Fen._pieceCodes={
		"P": Piece.WHITE_PAWN,
		"N": Piece.WHITE_KNIGHT,
		"B": Piece.WHITE_BISHOP,
		"R": Piece.WHITE_ROOK,
		"Q": Piece.WHITE_QUEEN,
		"K": Piece.WHITE_KING,
		"p": Piece.BLACK_PAWN,
		"n": Piece.BLACK_KNIGHT,
		"b": Piece.BLACK_BISHOP,
		"r": Piece.BLACK_ROOK,
		"q": Piece.BLACK_QUEEN,
		"k": Piece.BLACK_KING
	};

	return Fen;
});
var Fen={};

Fen.getPieceCode=function(piece) {
	return Fen._pieceCodes[piece];
};

Fen.getPieceChar=function(piece) {
	return Fen._pieceChars[piece];
};

Fen.fenPositionToArray=function(fenPosition) {
	var arr=[];
	var ranks=fenPosition.split(FEN_RANK_SEPARATOR);

	var r, f, i, j, n;
	var file, sq;

	for(r=7; r>-1; r--) {
		file=ranks[r].split("");

		i=0;
		f=0;

		while(i<8) {
			sq=file[f];

			if(FEN_PIECES.indexOf(sq)!==-1) {
				arr.push(Fen.getPieceCode(sq));
				i++;
			}

			else if(RANK.indexOf(sq)!==-1) { //FIXME don't use RANK here - check if it's a number
				n=parseInt(sq);

				for(j=0; j<n; j++) {
					arr.push(SQ_EMPTY);
					i++;
				}
			}

			else {
				i++;
			}

			f++;
		}
	}

	return arr;
};

Fen.arrayToFenPosition=function(arr) {
	var pos=[];
	var rank=[];

	for(var i=56; i>-1; i-=8) {
		rank.push(arr.slice(i, i+8));
	}

	var n, fenRank, next, piece;

	for(var r in rank) {
		n=0;
		fenRank="";

		for(var j=0; j<rank[r].length; j++) {
			piece=rank[r][j];

			next=null;

			if(j<7) {
				next=rank[r][j+1];
			}

			if(piece===SQ_EMPTY) {
				n++;

				if(next!==SQ_EMPTY) {
					fenRank+=n;
					n=0;
				}
			}

			else {
				fenRank+=Fen.getPieceChar(piece);
			}
		}

		pos.push(fenRank);
	}

	return pos.join(FEN_RANK_SEPARATOR);
};

Fen.fenToArray=function(fen) {
	return fen.split(FEN_SEPARATOR);
};

Fen.arrayToFen=function(array) {
	return array.join(FEN_SEPARATOR);
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
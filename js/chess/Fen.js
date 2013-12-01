var Fen={
	pieceChar: [
		"_",
		"P",
		"N",
		"B",
		"R",
		"Q",
		"K",
		null,
		null,
		"p",
		"n",
		"b",
		"r",
		"q",
		"k"
	],

	pieceInt: {
		"_": SQ_EMPTY,
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
	},

	castlingSign: [
		[
			FEN_WHITE_CASTLE_KS,
			FEN_WHITE_CASTLE_QS
		],
		[
			FEN_BLACK_CASTLE_KS,
			FEN_BLACK_CASTLE_QS
		]
	],

	getPieceInt: function(piece) {
		return Fen.pieceInt[piece];
	},

	getPieceChar: function(piece) {
		return Fen.pieceChar[piece];
	},

	posToArray: function(pos) {
		var arr=[];
		var rank=pos.split(FEN_POS_SEPARATOR);

		var r, f, i, j, n;
		var file, sq;

		for(r=7; r>-1; r--) {
			file=rank[r].split("");

			i=0;
			f=0;

			while(i<8) {
				sq=file[f];

				if(FEN_PIECES.indexOf(sq)!==-1) {
					arr.push(Fen.getPieceInt(sq));
					i++;
				}

				else if(RANK.indexOf(sq)!==-1) {
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
	},

	arrayToPos: function(arr) {
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

		return pos.join(FEN_POS_SEPARATOR);
	},

	fenToArray: function(fen) {
		return fen.split(FEN_SEPARATOR);
	},

	arrayToFen: function(arr) {
		return arr.join(FEN_SEPARATOR);
	},

	castlingInt: function(str) {
		if(str==FEN_NONE) {
			return CASTLING_NONE;
		}

		var castling=CASTLING_NONE;
		var n;

		for(var colour=WHITE; colour<=BLACK; colour++) {
			for(var side=KINGSIDE; side<=QUEENSIDE; side++) {
				n=(str.indexOf(this.castlingSign[colour][side])===-1)?0:1;
				castling=Util.set_castling(castling, colour, side, n);
			}
		}

		return castling;
	},

	castlingStr: function(n) {
		if(n==CASTLING_NONE) {
			return FEN_NONE;
		}

		var castling="";

		for(var colour=WHITE; colour<=BLACK; colour++) {
			for(var side=KINGSIDE; side<=QUEENSIDE; side++) {
				if(Util.get_castling(n, colour, side)) {
					castling+=Fen.castlingSign[colour][side];
				}
			}
		}

		return castling;
	},

	colourStr: function(colour) {
		return colour===BLACK?FEN_ACTIVE_BLACK:FEN_ACTIVE_WHITE;
	},

	colourInt: function(str) {
		return str===FEN_ACTIVE_BLACK?BLACK:WHITE;
	}
};
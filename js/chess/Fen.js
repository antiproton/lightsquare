var Fen={
	piece_char: [
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

	piece_int: {
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

	castling_sign: [
		[
			FEN_WHITE_CASTLE_KS,
			FEN_WHITE_CASTLE_QS
		],
		[
			FEN_BLACK_CASTLE_KS,
			FEN_BLACK_CASTLE_QS
		]
	],

	get_piece_int: function(piece) {
		return Fen.piece_int[piece];
	},

	get_piece_char: function(piece) {
		return Fen.piece_char[piece];
	},

	pos_to_array: function(pos) {
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
					arr.push(Fen.get_piece_int(sq));
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

	array_to_pos: function(arr) {
		var pos=[];
		var rank=[];

		for(var i=56; i>-1; i-=8) {
			rank.push(arr.slice(i, i+8));
		}

		var n, fen_rank, next, piece;

		for(var r in rank) {
			n=0;
			fen_rank="";

			for(var j=0; j<rank[r].length; j++) {
				piece=rank[r][j];

				next=null;

				if(j<7) {
					next=rank[r][j+1];
				}

				if(piece===SQ_EMPTY) {
					n++;

					if(next!==SQ_EMPTY) {
						fen_rank+=n;
						n=0;
					}
				}

				else {
					fen_rank+=Fen.get_piece_char(piece);
				}
			}

			pos.push(fen_rank);
		}

		return pos.join(FEN_POS_SEPARATOR);
	},

	fen_to_array: function(fen) {
		return fen.split(FEN_SEPARATOR);
	},

	array_to_fen: function(arr) {
		return arr.join(FEN_SEPARATOR);
	},

	castling_int: function(str) {
		if(str==FEN_NONE) {
			return CASTLING_NONE;
		}

		var castling=CASTLING_NONE;
		var n;

		for(var colour=WHITE; colour<=BLACK; colour++) {
			for(var side=KINGSIDE; side<=QUEENSIDE; side++) {
				n=(str.indexOf(this.castling_sign[colour][side])===-1)?0:1;
				castling=Util.set_castling(castling, colour, side, n);
			}
		}

		return castling;
	},

	castling_str: function(n) {
		if(n==CASTLING_NONE) {
			return FEN_NONE;
		}

		var castling="";

		for(var colour=WHITE; colour<=BLACK; colour++) {
			for(var side=KINGSIDE; side<=QUEENSIDE; side++) {
				if(Util.get_castling(n, colour, side)) {
					castling+=Fen.castling_sign[colour][side];
				}
			}
		}

		return castling;
	},

	colour_str: function(colour) {
		return colour===BLACK?FEN_ACTIVE_BLACK:FEN_ACTIVE_WHITE;
	},

	colour_int: function(str) {
		return str===FEN_ACTIVE_BLACK?BLACK:WHITE;
	}
};
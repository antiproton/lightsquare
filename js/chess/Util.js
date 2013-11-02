/*
NOTE this is the exception to the rule of lowercase and underscore
for private/titlecase for public.

TODO could do with making sq, x, get_file, file etc more well named.
and fullmove/halfmove etc.

colour_name etc could probs be replaced with not functions, more like
Result
*/

var Util={
	hm_colour: function(hm) {
		return (hm%2==1)?BLACK:WHITE;
	},

	opp_colour: function(colour) {
		return btoi(!colour); //NOTE relies on colours being 0 and 1
	},

	opp_game: function(game_id) {
		return btoi(!game_id);
	},

	fullmove_index: function(hm) {
		return Math.floor(hm/2);
	},

	fullmove: function(hm) { //PGN fullmove number
		return Util.fullmove_index(hm)+1;
	},

	halfmove: function(fullmove) {
		return (fullmove-1)*2; //halfmove of white's move of the specified fullmove
	},

	fullmove_dot: function(colour) { //NOTE relies on colours being 0 and 1
		return [".", "..."][colour];
	},

	score: function(result, colour) {
		if(result===RESULT_DRAW) {
			return SCORE_DRAW;
		}

		if(colour===WHITE) {
			return result===RESULT_WHITE?SCORE_WIN:SCORE_LOSS;
		}

		if(colour===BLACK) {
			return result===RESULT_BLACK?SCORE_WIN:SCORE_LOSS;
		}
	},

	halfmove_index: function(hm) {
		return hm%2;
	},

	type: function(piece) {
		return piece&TYPE;
	},

	colour: function(piece) {
		return piece>>COLOUR;
	},

	piece: function(type, colour) {
		return (colour<<COLOUR)|type;
	},

	on_board: function(sq) {
		return (sq>-1 && sq<64);
	},

	fr_to_sq: function(f, r) {
		return r*8+f;
	},

	sq_colour: function(sq) { //WTF? must be a simpler way of doing this
		return (!(((sq%2)+(Math.floor(sq/8)%2))%2))-0;
	},

	colour_name: function(colour) {
		var fen={w: "white", b: "black"};
		var name={white: "white", black: "white"};
		var num=[];

		num[WHITE]="white"
		num[BLACK]="black";

		if(colour in fen) {
			return fen[colour];
		}

		else if(colour in name) {
			return name[colour];
		}

		else {
			return num[colour];
		}
	},

	colour_fen: function(colour) {
		var fen={w: FEN_ACTIVE_WHITE, b: FEN_ACTIVE_BLACK};
		var name={white: FEN_ACTIVE_WHITE, black: FEN_ACTIVE_BLACK};
		var num=[];

		num[WHITE]=FEN_ACTIVE_WHITE;
		num[BLACK]=FEN_ACTIVE_BLACK;

		if(colour in fen) {
			return fen[colour];
		}

		else if(colour in name) {
			return name[colour];
		}

		else {
			return num[colour];
		}
	},

	colour_int: function(colour) {
		var fen={w: WHITE, b: BLACK};
		var name={white: WHITE, black: BLACK};
		var num=[];

		num[WHITE]=WHITE;
		num[BLACK]=BLACK;

		if(colour in fen) {
			return fen[colour];
		}

		else if(colour in name) {
			return name[colour];
		}

		else {
			return num[colour];
		}
	},

	rel_sq_no: function(sq, colour) {
		return (colour===BLACK?63-sq:sq);
	},

	x: function(sq) {
		return (sq%8);
	},

	y: function(sq) {
		return ((sq-Util.x(sq))/8);
	},

	file_str: function(sq) {
		return FILE.substr(sq%8, 1);
	},

	rank_str: function(sq) {
		return RANK.substr(((sq-(sq%8))/8), 1);
	},

	file: function(sq) {
		return FILE.substr(sq%8, 1);
	},

	rank: function(sq) {
		return RANK.substr(((sq-(sq%8))/8), 1);
	},

	sq: function(sq) {
		return Util.coords_to_sq([FILE.indexOf(sq.charAt(X)), RANK.indexOf(sq.charAt(Y))]);
	},

	alg_sq: function(sq) {
		return Util.file(sq)+Util.rank(sq);
	},

	sq_to_coords: function(sq) {
		var x=sq%8, y=(sq-x)/8;
		return [x, y];
	},

	coords_to_sq: function(coords) {
		return (coords[Y]*8)+coords[X];
	},

	diff: function(a, b) {
		return Math.abs(a-b);
	},

	same_file: function(a, b) { //abs sq nos
		return Util.file(a)===Util.file(b);
	},

	same_rank: function(a, b) { //abs sq nos
		return Util.rank(a)===Util.rank(b);
	},

	regular_move: function(type, fc, tc) {
		var d=[];
		var coord=[X, Y];

		for(var i=0; i<coord.length; i++) {
			d[coord[i]]=Util.diff(fc[coord[i]], tc[coord[i]]);
		}

		if(d[X]===0 && d[Y]===0) {
			return false;
		}

		switch(type) {
			case KNIGHT: {
				return ((d[X]===2 && d[Y]===1) || (d[X]===1 && d[Y]===2));
			}

			case BISHOP: {
				return (d[X]===d[Y]);
			}

			case ROOK: {
				return (d[X]===0 || d[Y]===0);
			}

			case QUEEN: {
				return (Util.regular_move(ROOK, fc, tc) || Util.regular_move(BISHOP, fc, tc));
			}

			case KING: {
				return ((d[X]===1 || d[X]===0) && (d[Y]===1 || d[Y]===0));
			}
		}

		return false;
	},

	pawn_move: function(fs, ts) {
		return (ts-fs===8);
	},

	pawn_move_double: function(fs, ts) {
		return (fs>7 && fs<16 && ts-fs===16);
	},

	pawn_move_capture: function(fs, ts) {
		var fc=Util.sq_to_coords(fs);
		var tc=Util.sq_to_coords(ts);

		return (tc[Y]-fc[Y]===1 && Util.diff(tc[X], fc[X])===1);
	},

	pawn_move_promote: function(ts) {
		return (ts>55);
	},

	ep_pawn: function(fs, ts) {
		return Util.coords_to_sq([Util.x(ts), Util.y(fs)]);
	},

	castling_details: function(fs, ts) {
		var king_start_pos=[4, 60];
		var king_end_pos;
		var n, o;
		var sign=[SIGN_CASTLE_KS, SIGN_CASTLE_QS];
		var rook;

		for(var i=0; i<king_start_pos.length; i++) {
			n=king_start_pos[i];

			if(fs===n) {
				king_end_pos=[n+2, n-2];

				for(var side=KINGSIDE; side<=QUEENSIDE; side++) {
					o=king_end_pos[side];

					if(ts===o) {
						rook=[
							[o+1, o-1],
							[o-2, o+1]
						];

						return {
							side: side,
							rook_start_pos: rook[side][0],
							rook_end_pos: rook[side][1],
							sign: sign[side]
						};
					}
				}
			}
		}

		return false;
	},

	distance_diagonal: function(fc, tc) {
		return Util.diff(fc[X], tc[X]);
	},

	squares_between: function(fs, ts, inclusive) {
		var arr=[];

		//go from lower to higher sq so same loop can be used in either dir

		var temp=fs;
		fs=Math.min(fs, ts);
		ts=Math.max(temp, ts);

		var fc=Util.sq_to_coords(fs);
		var tc=Util.sq_to_coords(ts);

		var difference=Util.diff(fs, ts);
		var increment;

		if(inclusive) {
			arr.push(fs);
		}

		if(Util.regular_move(BISHOP, fc, tc)) {
			var distance=Util.distance_diagonal(fc, tc);

			if(distance>0) {
				increment=difference/distance;

				for(var n=fs+increment; n<ts; n+=increment) {
					arr.push(n);
				}
			}
		}

		else if(Util.regular_move(ROOK, fc, tc)) {
			increment=difference>7?8:1; //?vertical:horizontal

			for(var n=fs+increment; n<ts; n+=increment) {
				arr.push(n);
			}
		}

		if(inclusive) {
			arr.push(ts);
		}

		return arr;
	},

	blocked: function(board, fs, ts) {
		var intermediate=Util.squares_between(fs, ts);

		for(var i=0; i<intermediate.length; i++) {
			if(board[intermediate[i]]!==SQ_EMPTY) {
				return true;
			}
		}

		return false;
	},

	moves_available: function(move, sq, colour) {
		var fc=Util.sq_to_coords(sq);
		var available=[];

		switch(move) {
			case PAWN: {
				var relsq=Util.rel_sq_no(sq, colour);

				//double

				if(relsq<16) {
					available.push(Util.rel_sq_no(relsq+16, colour));
				}

				//single and captures

				var relcoords=Util.sq_to_coords(relsq);
				var _x, _y;

				for(var x_diff=-1; x_diff<2; x_diff++) {
					_x=relcoords[X]+x_diff;
					_y=relcoords[Y]+1;

					if(_x>-1 && _x<8 && _y>-1 && _y<8) {
						available.push(Util.rel_sq_no(Util.coords_to_sq([_x, _y]), colour));
					}
				}

				break;
			}

			case KNIGHT: {
				var xdiff=[-1, -1, 1, 1, -2, -2, 2, 2];
				var ydiff=[-2, 2, -2, 2, 1, -1, 1, -1];

				var _x, _y;

				for(var i=0; i<8; i++) {
					_x=fc[X]+xdiff[i];
					_y=fc[Y]+ydiff[i];

					if(_x>-1 && _x<8 && _y>-1 && _y<8) {
						available.push(Util.coords_to_sq([_x, _y]));
					}
				}

				break;
			}

			case BISHOP: {
				var diff=[1, -1];

				for(var ix=0; ix<diff.length; ix++) {
					for(var iy=0; iy<diff.length; iy++) {
						var coords=[fc[X], fc[Y]]; //temp copy of coords for branching

						while(coords[X]>-1 && coords[X]<8 && coords[Y]>-1 && coords[Y]<8) {
							coords[X]+=diff[ix];
							coords[Y]+=diff[iy];

							if(coords[X]>-1 && coords[X]<8 && coords[Y]>-1 && coords[Y]<8) {
								available.push(Util.coords_to_sq([coords[X], coords[Y]]));
							}
						}
					}
				}

				break;
			}

			case ROOK: {
				var square;

				for(var i=0; i<8; i++) {
					square=[
						(fc[Y]*8)+i, //same rank
						fc[X]+(i*8) //same file
					];

					for(var n=0; n<square.length; n++) {
						if(square[n]!==sq) {
							available.push(square[n]);
						}
					}
				}

				break;
			}

			case QUEEN: {
				var r=Util.moves_available(ROOK, sq, colour);
				var b=Util.moves_available(BISHOP, sq, colour);

				available=[].concat(r, b);

				break;
			}

			case KING: {
				//regular

				var _x, _y;

				for(var x_diff=-1; x_diff<2; x_diff++) {
					_x=fc[X]+x_diff;

					if(_x>-1 && _x<8) {
						for(var y_diff=-1; y_diff<2; y_diff++) {
							_y=fc[Y]+y_diff;

							if(_y>-1 && _y<8) {
								available.push(Util.coords_to_sq([_x, _y]));
							}
						}
					}
				}

				//castling

				var x_diff=[-2, 2];

				for(var i=0; i<x_diff.length; i++) {
					_x=fc[X]+x_diff[i];

					if(_x>-1 && _x<8) {
						available.push(Util.coords_to_sq([_x, fc[Y]]));
					}
				}

				break;
			}
		}

		return available;
	},

	pieces_attacking: function(board, type, sq, colour) {
		var attacker=[];
		var piece=Util.piece(type, colour);
		var square=Util.moves_available(type, sq, colour);
		var n;

		for(var i=0; i<square.length; i++) {
			n=square[i];

			if(board[n]===piece && !Util.blocked(board, sq, n)) {
				attacker.push(n);
			}
		}

		return attacker;
	},

	pawns_attacking: function(board, sq, colour) {
		var piece=Util.piece(PAWN, colour);
		var plr_colour=btoi(!colour);
		var relsq=Util.rel_sq_no(sq, plr_colour);
		var relcoords=Util.sq_to_coords(relsq);
		var x_diff=[-1, 1];
		var d, _x, _y, n;
		var attacker=[];


		for(var i=0; i<x_diff.length; i++) {
			d=x_diff[i];
			_x=relcoords[X]+d;
			_y=relcoords[Y]+1;

			if(_x>-1 && _x<8 && _y>-1 && _y<8) {
				n=Util.rel_sq_no(Util.coords_to_sq([_x, _y]), plr_colour);

				if(board[n]===piece) {
					attacker.push(n);
				}
			}
		}

		return attacker;
	},

	kings_attacking: function(board, sq, colour) {
		var piece=Util.piece(KING, colour);
		var coords=Util.sq_to_coords(sq);
		var _x, _y, n;
		var attacker=[];

		for(var x_diff=-1; x_diff<2; x_diff++) {
			_x=coords[X]+x_diff;

			if(_x>-1 && _x<8) {
				for(var y_diff=-1; y_diff<2; y_diff++) {
					_y=coords[Y]+y_diff;

					if(_y>-1 && _y<8) {
						n=Util.coords_to_sq([_x, _y]);

						if(board[n]===piece) {
							attacker.push(n);
						}
					}
				}
			}
		}

		return attacker;
	},

	attackers: function(board, sq, colour) {
		var attacker=[];
		var type=[KNIGHT, BISHOP, ROOK, QUEEN];

		for(var i=0; i<type.length; i++) {
			attacker=attacker.concat(Util.pieces_attacking(board, type[i], sq, colour));
		}

		attacker=attacker.concat(Util.pawns_attacking(board, sq, colour));
		attacker=attacker.concat(Util.kings_attacking(board, sq, colour));

		return attacker;
	},

	set_castling: function(original, colour, side, allow) {
		var field=1<<(colour*2+side);
		return allow?(original|field):(~field)&original;
	},

	get_castling: function(original, colour, side) {
		return (original>>(colour*2+side))&1;
	},

	disambiguate: function(board, type, colour, fs, ts) {
		var str="";
		var pieces_in_range=Util.pieces_attacking(board, type, ts, colour);
		var n;

		if(pieces_in_range.length>1) {
			var disambiguation={
				file: "",
				rank: ""
			};

			for(var i=0; i<pieces_in_range.length; i++) {
				n=pieces_in_range[i];

				if(n!==fs) {
					if(Util.rank(n)===Util.rank(fs)) {
						disambiguation.file=Util.file(fs);
					}

					if(Util.file(n)===Util.file(fs)) {
						disambiguation.rank=Util.rank(fs);
					}
				}
			}

			str=disambiguation.file+disambiguation.rank;

			//if neither rank nor file is the same, specify file

			if(str.length===0) {
				str=Util.file(fs);
			}
		}

		return str;
	},

	elo: function(p, o, s) {
		return Math.round((p+(((p>-1 && p<2100)?32:((p>2099 && p<2400)?24:16))*(s-(1/(1+(Math.pow(10, ((o-p)/400)))))))));
	}
}
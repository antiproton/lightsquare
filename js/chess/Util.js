/*
NOTE this is the exception to the rule of lowercase and underscore
for private/titlecase for public.

CLEAN:

names

what fullmove, halfmove etoCoords are
*/

var Util={
	colourFromHalfmove: function(halfmove) {
		return (Util.getHalfmoveIndex(halfmove)===1?BLACK:WHITE);
	},

	getOppColour: function(colour) {
		return (colour===BLACK?WHITE:BLACK);
	},

	getOppGame: function(gameId) {
		return (gameId?0:1);
	},

	fullmoveIndexFromHalfmove: function(halfmove) { //which fullmove the halfmove is in, zero-based
		return Math.floor(halfmove/2);
	},

	fullmoveFromHalfmove: function(halfmove) { //PGN fullmove number
		return Util.fullmoveIndexFromHalfmove(halfmove)+1;
	},

	halfmoveFromFullmove: function(fullmove) {
		return (fullmove-1)*2;
	},

	fullmoveDotFromColour: function(colour) { //NOTE relies on colours being 0 and 1
		return [".", "..."][colour];
	},

	getScore: function(result, colour) {
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

	getHalfmoveIndex: function(halfmove) {
		return halfmove%2;
	},

	getType: function(piece) {
		return piece&TYPE;
	},

	getColour: function(piece) {
		return piece>>COLOUR;
	},

	getPiece: function(type, colour) {
		return (colour<<COLOUR)|type;
	},

	isOnBoard: function(square) {
		return (square>-1 && sq<64);
	},

	getSquareColour: function(square) {
		return (!(((square%2)+(Math.floor(square/8)%2))%2))?BLACK:WHITE;
	},

	getRelativeSquare: function(square, colour) {
		return (colour===BLACK?63-square:square);
	},

	xFromSquare: function(square) {
		return (square%8);
	},

	yFromSquare: function(square) {
		return ((square-Util.xFromSquare(square))/8);
	},

	fileFromSquare: function(square) {
		return FILE.substr(square%8, 1);
	},

	rankFromSquare: function(sq) {
		return RANK.substr(((sq-(sq%8))/8), 1);
	},

	squareFromAlgebraic: function(algebraicSquare) {
		return Util.squareFromCoords([
			FILE.indexOf(algebraicSquare.charAt(X)),
			RANK.indexOf(algebraicSquare.charAt(Y))
		]);
	},

	algebraicFromSquare: function(square) {
		return Util.fileFromSquare(square)+Util.rankFromSquare(square);
	},

	coordsFromSquare: function(square) {
		var x=square%8;
		var y=(square-x)/8;

		return [x, y];
	},

	squareFromCoords: function(coords) {
		return (coords[Y]*8)+coords[X];
	},

	diff: function(a, b) {
		return Math.abs(a-b);
	},

	squaresAreOnSameFile: function(squareA, squareB) {
		return Util.fileFromSquare(squareA)===Util.fileFromSquare(squareB);
	},

	squaresAreOnSameRank: function(squareA, squareB) { //abs sq nos
		return Util.rankFromSquare(a)===Util.rankFromSquare(b);
	},

	isRegularMove: function(type, fromCoords, toCoords) {
		var d=[];
		var coord=[X, Y];

		for(var i=0; i<coord.length; i++) {
			d[coord[i]]=Util.diff(fromCoords[coord[i]], toCoords[coord[i]]);
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
				return (Util.isRegularMove(ROOK, fromCoords, toCoords) || Util.isRegularMove(BISHOP, fromCoords, toCoords));
			}

			case KING: {
				return ((d[X]===1 || d[X]===0) && (d[Y]===1 || d[Y]===0));
			}
		}

		return false;
	},

	isPawnMove: function(from, to) {
		return (to-from===8);
	},

	isDoublePawnMove: function(from, to) {
		return (from>7 && from<16 && to-from===16);
	},

	isPawnCapture: function(from , to) {
		var fromCoords=Util.coordsFromSquare(from);
		var toCoords=Util.coordsFromSquare(to);

		return (toCoords[Y]-fromCoords[Y]===1 && Util.diff(toCoords[X], fromCoords[X])===1);
	},

	isPawnPromotion: function(to) {
		return (to>55);
	},

	getEpPawn: function(capturerFrom, capturerTo) {
		return Util.squareFromCoords([Util.xFromSquare(capturerTo), Util.yFromSquare(capturerFrom)]);
	},

	getDiagonalDistance: function(fromCoords, toCoords) {
		return Util.diff(fromCoords[X], toCoords[X]);
	},

	getSquaresBetween: function(from, to, inclusive) {
		var squares=[];

		//go from lower to higher sq so same loop can be used in either dir

		var temp=from;
		from=Math.min(from, to);
		to=Math.max(temp, to);

		var fromCoords=Util.coordsFromSquare(from);
		var toCoords=Util.coordsFromSquare(to);

		var difference=Util.diff(from, to);
		var increment;

		if(inclusive) {
			squares.push(from);
		}

		if(Util.isRegularMove(BISHOP, fromCoords, toCoords)) {
			var distance=Util.getDiagonalDistance(fromCoords, toCoords);

			if(distance>0) {
				increment=difference/distance;

				for(var n=from+increment; n<to; n+=increment) {
					squares.push(n);
				}
			}
		}

		else if(Util.isRegularMove(ROOK, fromCoords, toCoords)) {
			increment=difference>7?8:1; //?vertical:horizontal

			for(var n=from+increment; n<to; n+=increment) {
				squares.push(n);
			}
		}

		if(inclusive) {
			squares.push(to);
		}

		return arr;
	},

	isBlocked: function(board, from, to) {
		var squares=Util.getSquaresBetween(from, to);

		for(var i=0; i<squares.length; i++) {
			if(board[squares[i]]!==SQ_EMPTY) {
				return true;
			}
		}

		return false;
	},

	getAvailableMoves: function(type, from, colour) {
		var fromCoords=Util.coordsFromSquare(from);
		var available=[];

		switch(type) {
			case PAWN: {
				var relativeSquare=Util.getRelativeSquare(from, colour);

				//double

				if(relativeSquare<16) {
					available.push(Util.getRelativeSquare(relativeSquare+16, colour));
				}

				//single and captures

				var relativeCoords=Util.coordsFromSquare(relativeSquare);
				var x, y;

				for(var xDiff=-1; xDiff<2; xDiff++) {
					x=relativeCoords[X]+xDiff;
					y=relativeCoords[Y]+1;

					if(x>-1 && x<8 && y>-1 && y<8) {
						available.push(Util.getRelativeSquare(Util.squareFromCoords([x, y]), colour));
					}
				}

				break;
			}

			case KNIGHT: {
				var xdiff=[-1, -1, 1, 1, -2, -2, 2, 2];
				var ydiff=[-2, 2, -2, 2, 1, -1, 1, -1];

				var x, y;

				for(var i=0; i<8; i++) {
					x=fromCoords[X]+xdiff[i];
					y=fromCoords[Y]+ydiff[i];

					if(x>-1 && x<8 && y>-1 && y<8) {
						available.push(Util.squareFromCoords([x, y]));
					}
				}

				break;
			}

			case BISHOP: {
				var diff=[1, -1];

				for(var ix=0; ix<diff.length; ix++) {
					for(var iy=0; iy<diff.length; iy++) {
						var coords=[fromCoords[X], fromCoords[Y]]; //temp copy of coords for branching

						while(coords[X]>-1 && coords[X]<8 && coords[Y]>-1 && coords[Y]<8) {
							coords[X]+=diff[ix];
							coords[Y]+=diff[iy];

							if(coords[X]>-1 && coords[X]<8 && coords[Y]>-1 && coords[Y]<8) {
								available.push(Util.squareFromCoords([coords[X], coords[Y]]));
							}
						}
					}
				}

				break;
			}

			case ROOK: {
				/*
				the algorithm here is to go off on both axes at once adding squares
				that are on the same file or rank as the from square
				*/

				var squareOnRank, squareOnFile;

				for(var n=0; n<8; n++) {
					squareOnRank=(fromCoords[Y]*8)+n;
					squareOnFile=fromCoords[X]+(n*8);

					if(squareOnRank!==from) {
						available.push(squareOnRank);
					}

					if(squareOnFile!==from) {
						available.push(squareOnFile);
					}
				}

				break;
			}

			case QUEEN: {
				var rookMovesAvailable=Util.getAvailableMoves(ROOK, from, colour);
				var bishopMovesAvailable=Util.getAvailableMoves(BISHOP, from, colour);

				available=[].concat(rookMovesAvailable, bishopMovesAvailable);

				break;
			}

			case KING: {
				//regular king moves:

				var x, y;

				for(var xDiff=-1; xDiff<2; xDiff++) {
					x=fromCoords[X]+xDiff;

					if(x>-1 && x<8) {
						for(var yDiff=-1; yDiff<2; yDiff++) {
							y=fromCoords[Y]+yDiff;

							if(y>-1 && y<8) {
								available.push(Util.squareFromCoords([x, y]));
							}
						}
					}
				}

				//castling moves:

				var xDiff=[-2, 2];

				for(var i=0; i<xDiff.length; i++) {
					x=fromCoords[X]+xDiff[i];

					if(x>-1 && x<8) {
						available.push(Util.squareFromCoords([x, fromCoords[Y]]));
					}
				}

				break;
			}
		}

		return available;
	},

	getAttackers: function(board, type, square, colour) {
		var attackers=[];
		var piece=Util.getPiece(type, colour);
		var candidateSquares=Util.getAvailableMoves(type, square, colour);
		var candidateSquare;

		for(var i=0; i<candidateSquares.length; i++) {
			candidateSquare=candidateSquares[i];

			if(board[candidateSquare]===piece && !Util.isBlocked(board, square, candidateSquare)) {
				attackers.push(candidateSquare);
			}
		}

		return attackers;
	},

	getPawnAttackers: function(board, square, colour) {
		var attackers=[];
		var piece=Util.getPiece(PAWN, colour);
		var playerColour=Util.getOppColour(colour);
		var relativeSquare=Util.getRelativeSquare(square, playerColour);
		var relativeCoords=Util.coordsFromSquare(relativeSquare);
		var xDiffs=[-1, 1];
		var xDiff;
		var x, y, candidateSquare;

		for(var i=0; i<xDiffs.length; i++) {
			xDiff=xDiffs[i];
			x=relativeCoords[X]+xDiff;
			y=relativeCoords[Y]+1;

			if(x>-1 && x<8 && y>-1 && y<8) {
				candidateSquare=Util.getRelativeSquare(Util.squareFromCoords([x, y]), playerColour);

				if(board[candidateSquare]===piece) {
					attackers.push(candidateSquare);
				}
			}
		}

		return attackers;
	},

	getKingAttackers: function(board, square, colour) {
		var attackers=[];
		var piece=Util.getPiece(KING, colour);
		var coords=Util.coordsFromSquare(square);
		var x, y, candidateSquare;

		for(var xDiff=-1; xDiff<2; xDiff++) {
			x=coords[X]+xDiff;

			if(x>-1 && x<8) {
				for(var yDiff=-1; yDiff<2; yDiff++) {
					y=coords[Y]+yDiff;

					if(y>-1 && y<8) {
						candidateSquare=Util.squareFromCoords([x, y]);

						if(board[candidateSquare]===piece) {
							attackers.push(candidateSquare);
						}
					}
				}
			}
		}

		return attackers;
	},

	getAllAttackers: function(board, square, colour) {
		var attackers=[];
		var pieceTypes=[KNIGHT, BISHOP, ROOK, QUEEN];

		for(var i=0; i<pieceTypes.length; i++) {
			attackers=attackers.concat(Util.getAttackers(board, pieceTypes[i], square, colour));
		}

		attackers=attackers.concat(Util.getPawnAttackers(board, square, colour));
		attackers=attackers.concat(Util.getKingAttackers(board, square, colour));

		return attackers;
	},

	disambiguate: function(board, type, colour, from, to) {
		var str="";
		var piecesInRange=Util.getAttackers(board, type, to, colour);
		var sq;

		var disambiguation={
			file: "",
			rank: ""
		};

		for(var i=0; i<piecesInRange.length; i++) {
			sq=piecesInRange[i];

			if(sq!==from) {
				if(Util.rankFromSquare(sq)===Util.rankFromSquare(from)) {
					disambiguation.file=Util.fileFromSquare(from);
				}

				if(Util.fileFromSquare(sq)===Util.fileFromSquare(from)) {
					disambiguation.rank=Util.rankFromSquare(from);
				}
			}
		}

		str=disambiguation.file+disambiguation.rank;

		//if neither rank nor file is the same, specify file

		if(piecesInRange.length>1 && str==="") {
			str=Util.fileFromSquare(from);
		}

		return str;
	},

	elo: function(p, o, s) {
		return Math.round((p+(((p>-1 && p<2100)?32:((p>2099 && p<2400)?24:16))*(s-(1/(1+(Math.pow(10, ((o-p)/400)))))))));
	}
}
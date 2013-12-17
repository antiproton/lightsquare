define(function(require) {
	var Piece=require("./Piece");

	var Chess={
		RANKS: "12345678",
		FILES: "abcdefgh",

		WHITE: 0,
		BLACK: 1,

		KINGSIDE: 0,
		QUEENSIDE: 1,

		KING_HOME_SQUARE_WHITE: 4,
		KING_HOME_SQUARE_BLACK: 60,



		colourFromHalfmove: function(halfmove) {
			return (Chess.getHalfmoveIndex(halfmove)===1?Piece.BLACK:Piece.WHITE);
		},

		getOppColour: function(colour) {
			return (colour===Piece.BLACK?Piece.WHITE:Piece.BLACK);
		},

		getOppGame: function(gameId) {
			return [1, 0][gameId];
		},

		fullmoveFromHalfmove: function(halfmove) {
			return Math.floor(halfmove/2)+1;
		},

		getHalfmove: function(fullmove, colour) {
			return ((fullmove-1)*2+(colour===Piece.WHITE?0:1));
		},

		getHalfmoveIndex: function(halfmove) {
			return halfmove%2;
		},

		fullmoveDotFromColour: function(colour) {
			var dots=[];

			dots[Piece.WHITE]=".";
			dots[Piece.BLACK]="...";

			return dots[colour];
		},

		isOnBoard: function(square) {
			return (square>-1 && sq<64);
		},

		getSquareColour: function(square) {
			var coords=Chess.coordsFromSquare(square);

			return (coords[X]%2===coords[Y]%2?Piece.BLACK:Piece.WHITE);
		},

		getRelativeSquare: function(square, colour) {
			return (colour===Piece.BLACK?63-square:square);
		},

		xFromSquare: function(square) {
			return (square%8);
		},

		yFromSquare: function(square) {
			return ((square-Chess.xFromSquare(square))/8);
		},

		fileFromSquare: function(square) {
			return Chess.FILES.charAt(Chess.xFromSquare(square));
		},

		rankFromSquare: function(square) {
			return Chess.RANKS.charAt(Chess.yFromSquare(square));
		},

		squareFromAlgebraic: function(algebraicSquare) {
			return Chess.squareFromCoords([
				Chess.FILES.indexOf(algebraicSquare.charAt(X)),
				Chess.RANKS.indexOf(algebraicSquare.charAt(Y))
			]);
		},

		algebraicFromSquare: function(square) {
			return Chess.fileFromSquare(square)+Chess.rankFromSquare(square);
		},

		coordsFromSquare: function(square) {
			var x=square%8;
			var y=(square-x)/8;

			return [x, y];
		},

		squareFromCoords: function(coords) {
			return (coords[Y]*8)+coords[X];
		},

		squaresAreOnSameFile: function(squareA, squareB) {
			return Chess.xFromSquare(squareA)===Chess.xFromSquare(squareB);
		},

		squaresAreOnSameRank: function(squareA, squareB) {
			return Chess.yFromSquare(squareA)===Chess.yFromSquare(squareB);
		},

		isRegularMove: function(type, fromCoords, toCoords) {
			var diff=[
				Math.abs(fromCoords[X]-toCoords[X]),
				Math.abs(fromCoords[Y]-toCoords[Y])
			];

			if(diff[X]===0 && diff[Y]===0) {
				return false;
			}

			switch(type) {
				case Piece.PAWN: {
					return false;
				}

				case Piece.KNIGHT: {
					return ((diff[X]===2 && diff[Y]===1) || (diff[X]===1 && diff[Y]===2));
				}

				case Piece.BISHOP: {
					return (diff[X]===diff[Y]);
				}

				case Piece.ROOK: {
					return (diff[X]===0 || diff[Y]===0);
				}

				case Piece.QUEEN: {
					return (diff[X]===diff[Y] || (diff[X]===0 || diff[Y]===0));
				}

				case Piece.KING: {
					return ((diff[X]===1 || diff[X]===0) && (diff[Y]===1 || diff[Y]===0));
				}
			}
		},

		isPawnMove: function(relFrom, relTo) {
			return (relTo-relFrom===8);
		},

		isDoublePawnMove: function(relFrom, relTo) {
			return (relFrom>7 && relFrom<16 && relTo-relFrom===16);
		},

		isPawnCapture: function(relFrom , relTo) {
			var fromCoords=Chess.coordsFromSquare(relFrom);
			var toCoords=Chess.coordsFromSquare(relTo);

			return (toCoords[Y]-fromCoords[Y]===1 && Math.abs(toCoords[X]-fromCoords[X])===1);
		},

		isPawnPromotion: function(relTo) {
			return (relTo>55);
		},

		getEpPawn: function(capturerFrom, capturerTo) {
			return Chess.squareFromCoords([Chess.xFromSquare(capturerTo), Chess.yFromSquare(capturerFrom)]);
		},

		getDiagonalDistance: function(fromCoords, toCoords) {
			return Math.abs(fromCoords[X]-toCoords[X]);
		},

		getSquaresBetween: function(from, to, inclusive) {
			var squares=[];

			var temp=from;

			from=Math.min(from, to);
			to=Math.max(temp, to);

			var fromCoords=Chess.coordsFromSquare(from);
			var toCoords=Chess.coordsFromSquare(to);

			var difference=to-from;
			var increment;

			if(inclusive) {
				squares.push(from);
			}

			if(Chess.isRegularMove(Piece.BISHOP, fromCoords, toCoords)) {
				var distance=Chess.getDiagonalDistance(fromCoords, toCoords);

				if(distance>0) {
					increment=difference/distance;

					for(var square=from+increment; square<to; square+=increment) {
						squares.push(square);
					}
				}
			}

			else if(Chess.isRegularMove(Piece.ROOK, fromCoords, toCoords)) {
				if(difference>7) { //vertical move
					increment=8;
				}

				else { //horizontal move
					increment=1;
				}

				for(var square=from+increment; square<to; square+=increment) {
					squares.push(square);
				}
			}

			if(inclusive) {
				squares.push(to);
			}

			return squares;
		},

		isBlocked: function(board, from, to) {
			var squares=Chess.getSquaresBetween(from, to);

			for(var i=0; i<squares.length; i++) {
				if(board[squares[i]]!==Piece.NONE) {
					return true;
				}
			}

			return false;
		},

		/*
		get a list of squares reachable from "from" by a piece of type "type", including
		all pawn moves and castling, without taking into account any other information or
		rules such as not moving through other pieces, moving into check, capturing own
		pieces or any castling rules other than "moving the king two squares to the left
		or right".
		*/

		getReachableSquares: function(type, from, colour) {
			var fromCoords=Chess.coordsFromSquare(from);
			var squares=[];

			switch(type) {
				case Piece.PAWN: {
					var relFrom=Chess.getRelativeSquare(from, colour);

					//double

					if(relFrom<16) {
						squares.push(Chess.getRelativeSquare(relFrom+16, colour));
					}

					//single and captures

					var relCoords=Chess.coordsFromSquare(relFrom);
					var x, y;

					for(var xDiff=-1; xDiff<2; xDiff++) {
						x=relCoords[X]+xDiff;
						y=relCoords[Y]+1;

						if(x>-1 && x<8 && y>-1 && y<8) {
							squares.push(Chess.getRelativeSquare(Chess.squareFromCoords([x, y]), colour));
						}
					}

					break;
				}

				case Piece.KNIGHT: {
					var xDiffs=[-1, -1, 1, 1, -2, -2, 2, 2];
					var yDiffs=[-2, 2, -2, 2, 1, -1, 1, -1];
					var x, y;

					for(var i=0; i<8; i++) {
						x=fromCoords[X]+xDiffs[i];
						y=fromCoords[Y]+yDiffs[i];

						if(x>-1 && x<8 && y>-1 && y<8) {
							squares.push(Chess.squareFromCoords([x, y]));
						}
					}

					break;
				}

				case Piece.BISHOP: {
					var diffs=[1, -1];
					var coords;

					for(var ix=0; ix<diffs.length; ix++) {
						for(var iy=0; iy<diffs.length; iy++) {
							coords=[fromCoords[X], fromCoords[Y]];

							while(coords[X]>0 && coords[X]<7 && coords[Y]>0 && coords[Y]<7) {
								coords[X]+=diffs[ix];
								coords[Y]+=diffs[iy];

								squares.push(Chess.squareFromCoords([coords[X], coords[Y]]));
							}
						}
					}

					break;
				}

				case Piece.ROOK: {
					var squareOnSameRank, squareOnSameFile;

					for(var n=0; n<8; n++) {
						squareOnSameRank=(fromCoords[Y]*8)+n;
						squareOnSameFile=fromCoords[X]+(n*8);

						if(squareOnSameRank!==from) {
							squares.push(squareOnSameRank);
						}

						if(squareOnSameFile!==from) {
							squares.push(squareOnSameFile);
						}
					}

					break;
				}

				case Piece.QUEEN: {
					var rookSquares=Chess.getReachableSquares(Piece.ROOK, from, colour);
					var bishopSquares=Chess.getReachableSquares(Piece.BISHOP, from, colour);

					squares=rookSquares.concat(bishopSquares);

					break;
				}

				case Piece.KING: {
					//regular king moves

					var x, y;

					for(var xDiff=-1; xDiff<2; xDiff++) {
						x=fromCoords[X]+xDiff;

						if(x>-1 && x<8) {
							for(var yDiff=-1; yDiff<2; yDiff++) {
								y=fromCoords[Y]+yDiff;

								if(y>-1 && y<8) {
									squares.push(Chess.squareFromCoords([x, y]));
								}
							}
						}
					}

					//castling moves

					var xDiffs=[-2, 2];

					for(var i=0; i<xDiffs.length; i++) {
						x=fromCoords[X]+xDiffs[i];

						if(x>-1 && x<8) {
							squares.push(Chess.squareFromCoords([x, fromCoords[Y]]));
						}
					}

					break;
				}
			}

			return squares;
		},

		getAttackers: function(board, type, square, colour) {
			/*
			king and pawn attacks are different to their normal moves (kings
			aren't attacking the squares they can castle to)
			*/

			if(type===Piece.PAWN) {
				return Chess.getPawnAttackers(board, square, colour);
			}

			else if(type===Piece.KING) {
				return Chess.getKingAttackers(board, square, colour);
			}

			/*
			the rest can all use getReachableSquares
			*/

			else {
				var attackers=[];
				var piece=Piece.getPiece(type, colour);
				var candidateSquares=Chess.getReachableSquares(type, square, colour);
				var candidateSquare;

				for(var i=0; i<candidateSquares.length; i++) {
					candidateSquare=candidateSquares[i];

					if(board[candidateSquare]===piece && !Chess.isBlocked(board, square, candidateSquare)) {
						attackers.push(candidateSquare);
					}
				}

				return attackers;
			}
		},

		getPawnAttackers: function(board, square, colour) {
			var attackers=[];
			var piece=Piece.getPiece(Piece.PAWN, colour);
			var playerColour=Chess.getOppColour(colour);
			var relSquare=Chess.getRelativeSquare(square, playerColour);
			var relCoords=Chess.coordsFromSquare(relSquare);
			var xDiffs=[-1, 1];
			var xDiff;
			var x, y, candidateSquare;

			for(var i=0; i<xDiffs.length; i++) {
				xDiff=xDiffs[i];
				x=relCoords[X]+xDiff;
				y=relCoords[Y]+1;

				if(x>-1 && x<8 && y>-1 && y<8) {
					candidateSquare=Chess.getRelativeSquare(Chess.squareFromCoords([x, y]), playerColour);

					if(board[candidateSquare]===piece) {
						attackers.push(candidateSquare);
					}
				}
			}

			return attackers;
		},

		getKingAttackers: function(board, square, colour) {
			var attackers=[];
			var piece=Piece.getPiece(Piece.KING, colour);
			var coords=Chess.coordsFromSquare(square);
			var x, y, candidateSquare;

			for(var xDiff=-1; xDiff<2; xDiff++) {
				x=coords[X]+xDiff;

				if(x>-1 && x<8) {
					for(var yDiff=-1; yDiff<2; yDiff++) {
						y=coords[Y]+yDiff;

						if(y>-1 && y<8) {
							candidateSquare=Chess.squareFromCoords([x, y]);

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
			var pieceTypes=[Piece.PAWN, Piece.KNIGHT, Piece.BISHOP, Piece.ROOK, Piece.QUEEN, Piece.KING];

			for(var i=0; i<pieceTypes.length; i++) {
				attackers=attackers.concat(Chess.getAttackers(board, pieceTypes[i], square, colour));
			}

			return attackers;
		},

		disambiguate: function(board, type, colour, from, to) {
			var disambiguationString="";
			var piecesInRange=Chess.getAttackers(board, type, to, colour);

			var disambiguation={
				file: "",
				rank: ""
			};

			var square;

			for(var i=0; i<piecesInRange.length; i++) {
				square=piecesInRange[i];

				if(square!==from) {
					if(Chess.xFromSquare(square)===Chess.xFromSquare(from)) {
						disambiguation.file=Chess.fileFromSquare(from);
					}

					if(Chess.yFromSquare(square)===Chess.yFromSquare(from)) {
						disambiguation.rank=Chess.rankFromSquare(from);
					}
				}
			}

			disambiguationString=disambiguation.file+disambiguation.rank;

			//if neither rank nor file is the same, specify file

			if(piecesInRange.length>1 && disambiguationString==="") {
				disambiguationString=Chess.fileFromSquare(from);
			}

			return disambiguationString;
		},

		elo: function(p, o, s) {
			return Math.round((p+(((p>-1 && p<2100)?32:((p>2099 && p<2400)?24:16))*(s-(1/(1+(Math.pow(10, ((o-p)/400)))))))));
		}
	};

	return Chess;
});
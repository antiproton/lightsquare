define(function(require) {
	require("chess/constants");
	var Piece = require("chess/Piece");

	var Chess = {
		RANKS: "12345678",
		FILES: "abcdefgh",

		KING_HOME_SQUARE_WHITE: 4,
		KING_HOME_SQUARE_BLACK: 60,

		getOppColour: function(colour) {
			return (colour === Piece.BLACK ? Piece.WHITE : Piece.BLACK);
		},

		getSquareColour: function(square) {
			var coords = Chess.coordsFromSquare(square);

			return (coords[X] % 2 === coords[Y] % 2 ? Piece.BLACK:Piece.WHITE);
		},

		getRelativeSquare: function(square, colour) {
			return (colour === Piece.BLACK ? 63 - square : square);
		},

		xFromSquare: function(square) {
			return (square % 8);
		},

		yFromSquare: function(square) {
			return ((square - Chess.xFromSquare(square))/8);
		},

		fileFromSquare: function(square) {
			return Chess.FILES.charAt(Chess.xFromSquare(square));
		},

		rankFromSquare: function(square) {
			return Chess.RANKS.charAt(Chess.yFromSquare(square));
		},

		squareFromAlgebraic: function(algebraicSquare) {
			return Chess.squareFromCoords([
				Chess.FILES.indexOf(algebraicSquare.charAt(0)),
				Chess.RANKS.indexOf(algebraicSquare.charAt(1))
			]);
		},

		algebraicFromSquare: function(square) {
			return Chess.fileFromSquare(square) + Chess.rankFromSquare(square);
		},

		coordsFromSquare: function(square) {
			var x = square % 8;
			var y = (square - x)/8;

			return [x, y];
		},

		squareFromCoords: function(coords) {
			return (coords[Y] * 8) + coords[X];
		},

		squaresAreOnSameFile: function(squareA, squareB) {
			return Chess.xFromSquare(squareA) === Chess.xFromSquare(squareB);
		},

		squaresAreOnSameRank: function(squareA, squareB) {
			return Chess.yFromSquare(squareA) === Chess.yFromSquare(squareB);
		},

		/*
		"regular" moves are all geometrically valid moves except pawn moves and castling.

		(all the moves that don't depend on colour or other circumstances, and can be checked
		by simply checking the relationship between the to square and the from square)
		*/

		isRegularMove: function(type, fromCoords, toCoords) {
			var diff = [
				Math.abs(fromCoords[X] - toCoords[X]),
				Math.abs(fromCoords[Y] - toCoords[Y])
			];

			if(diff[X] === 0 && diff[Y] === 0) {
				return false;
			}

			switch(type) {
				case Piece.PAWN: {
					return false;
				}

				case Piece.KNIGHT: {
					return ((diff[X] === 2 && diff[Y] === 1) || (diff[X] === 1 && diff[Y] === 2));
				}

				case Piece.BISHOP: {
					return (diff[X] === diff[Y]);
				}

				case Piece.ROOK: {
					return (diff[X] === 0 || diff[Y] === 0);
				}

				case Piece.QUEEN: {
					return (diff[X] === diff[Y] || (diff[X] === 0 || diff[Y] === 0));
				}

				case Piece.KING: {
					return ((diff[X] === 1 || diff[X] === 0) && (diff[Y] === 1 || diff[Y] === 0));
				}
			}
		},

		isPawnMove: function(relFrom, relTo) {
			return (relTo-relFrom === 8);
		},

		isDoublePawnMove: function(relFrom, relTo) {
			return (relFrom > 7 && relFrom < 16 && relTo - relFrom === 16);
		},

		isPawnCapture: function(relFrom , relTo) {
			var fromCoords = Chess.coordsFromSquare(relFrom);
			var toCoords = Chess.coordsFromSquare(relTo);

			return (toCoords[Y] - fromCoords[Y] === 1 && Math.abs(toCoords[X] - fromCoords[X]) === 1);
		},

		isPawnPromotion: function(relTo) {
			return (relTo > 55);
		},

		getEpPawn: function(capturerFrom, capturerTo) {
			return Chess.squareFromCoords([Chess.xFromSquare(capturerTo), Chess.yFromSquare(capturerFrom)]);
		},

		getDiagonalDistance: function(fromCoords, toCoords) {
			return Math.abs(fromCoords[X] - toCoords[X]);
		},

		getSquaresBetween: function(from, to, inclusive) {
			var squares = [];

			var temp = from;

			from = Math.min(from, to);
			to = Math.max(temp, to);

			var fromCoords = Chess.coordsFromSquare(from);
			var toCoords = Chess.coordsFromSquare(to);

			var difference = to - from;
			var increment;

			if(inclusive) {
				squares.push(from);
			}

			if(Chess.isRegularMove(Piece.BISHOP, fromCoords, toCoords)) {
				var distance = Chess.getDiagonalDistance(fromCoords, toCoords);

				if(distance > 0) {
					increment = difference/distance;

					for(var square = from + increment; square < to; square += increment) {
						squares.push(square);
					}
				}
			}

			else if(Chess.isRegularMove(Piece.ROOK, fromCoords, toCoords)) {
				if(difference > 7) { //vertical move
					increment = 8;
				}

				else { //horizontal move
					increment = 1;
				}

				for(var square = from + increment; square < to; square += increment) {
					squares.push(square);
				}
			}

			if(inclusive) {
				squares.push(to);
			}

			return squares;
		},

		/*
		get a list of squares reachable by a piece of the given type and colour, including
		all pawn moves and castling, without taking into account any other information or
		rules such as not moving through other pieces, moving into check, capturing own
		pieces, or any castling rules other than "moving the king two squares to the left
		or right".
		*/

		getReachableSquares: function(type, from, colour) {
			var fromCoords = Chess.coordsFromSquare(from);
			var squares = [];

			switch(type) {
				case Piece.PAWN: {
					var relFrom = Chess.getRelativeSquare(from, colour);

					//double

					if(relFrom < 16) {
						squares.push(Chess.getRelativeSquare(relFrom + 16, colour));
					}

					//single and captures

					var relCoords = Chess.coordsFromSquare(relFrom);
					var x, y;

					for(var xDiff = -1; xDiff < 2; xDiff++) {
						x = relCoords[X] + xDiff;
						y = relCoords[Y] + 1;

						if(x > -1 && x < 8 && y > -1 && y < 8) {
							squares.push(Chess.getRelativeSquare(Chess.squareFromCoords([x, y]), colour));
						}
					}

					break;
				}

				case Piece.KNIGHT: {
					var xDiffs = [-1, -1, 1, 1, -2, -2, 2, 2];
					var yDiffs = [-2, 2, -2, 2, 1, -1, 1, -1];
					var x, y;

					for(var i = 0; i < 8; i++) {
						x = fromCoords[X] + xDiffs[i];
						y = fromCoords[Y] + yDiffs[i];

						if(x > -1 && x < 8 && y > -1 && y < 8) {
							squares.push(Chess.squareFromCoords([x, y]));
						}
					}

					break;
				}

				case Piece.BISHOP: {
					var diffs = [1, -1];
					var coords;

					for(var ix = 0; ix < diffs.length; ix++) {
						for(var iy = 0; iy < diffs.length; iy++) {
							coords = [fromCoords[X], fromCoords[Y]];

							while(true) {
								coords[X] += diffs[ix];
								coords[Y] += diffs[iy];

								if(coords[X] > -1 && coords[X] < 8 && coords[Y] > -1 && coords[Y] < 8) {
									squares.push(Chess.squareFromCoords(coords));
								}

								else {
									break;
								}
							}
						}
					}

					break;
				}

				case Piece.ROOK: {
					var squareOnSameRank, squareOnSameFile;

					for(var n = 0; n < 8; n++) {
						squareOnSameRank = (fromCoords[Y] * 8) + n;
						squareOnSameFile = fromCoords[X] + (n * 8);

						if(squareOnSameRank !== from) {
							squares.push(squareOnSameRank);
						}

						if(squareOnSameFile !== from) {
							squares.push(squareOnSameFile);
						}
					}

					break;
				}

				case Piece.QUEEN: {
					var rookSquares = Chess.getReachableSquares(Piece.ROOK, from, colour);
					var bishopSquares = Chess.getReachableSquares(Piece.BISHOP, from, colour);

					squares = rookSquares.concat(bishopSquares);

					break;
				}

				case Piece.KING: {
					//regular king moves

					var x, y;

					for(var xDiff = -1; xDiff < 2; xDiff++) {
						x = fromCoords[X] + xDiff;

						if(x > -1 && x < 8) {
							for(var yDiff = -1; yDiff < 2; yDiff++) {
								y = fromCoords[Y] + yDiff;

								if(y > -1 && y < 8) {
									squares.push(Chess.squareFromCoords([x, y]));
								}
							}
						}
					}

					//castling moves

					var xDiffs = [-2, 2];

					for(var i = 0; i < xDiffs.length; i++) {
						x = fromCoords[X] + xDiffs[i];

						if(x > -1 && x < 8) {
							squares.push(Chess.squareFromCoords([x, fromCoords[Y]]));
						}
					}

					break;
				}
			}

			return squares;
		}
	};

	return Chess;
});
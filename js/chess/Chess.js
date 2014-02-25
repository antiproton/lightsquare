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

			return (coords.x % 2 === coords.y % 2 ? Piece.BLACK : Piece.WHITE);
		},

		getRelativeSquare: function(square, colour) {
			return (colour === Piece.BLACK ? 63 - square : square);
		},

		xFromSquare: function(square) {
			return (square % 8);
		},

		yFromSquare: function(square) {
			return ((square - Chess.xFromSquare(square)) / 8);
		},

		fileFromSquare: function(square) {
			return Chess.FILES.charAt(Chess.xFromSquare(square));
		},

		rankFromSquare: function(square) {
			return Chess.RANKS.charAt(Chess.yFromSquare(square));
		},

		squareFromAlgebraic: function(algebraicSquare) {
			return Chess.squareFromCoords({
				x: Chess.FILES.indexOf(algebraicSquare.charAt(0)),
				y: Chess.RANKS.indexOf(algebraicSquare.charAt(1))
			});
		},

		algebraicFromSquare: function(square) {
			return Chess.fileFromSquare(square) + Chess.rankFromSquare(square);
		},

		coordsFromSquare: function(square) {
			var x = square % 8;
			var y = (square - x) / 8;

			return {
				x: x,
				y: y
			};
		},

		squareFromCoords: function(coords) {
			return (coords.y * 8) + coords.x;
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
			var diff = {
				x: Math.abs(fromCoords.x - toCoords.x),
				y: Math.abs(fromCoords.y - toCoords.y)
			};

			if(diff.x === 0 && diff.y === 0) {
				return false;
			}

			switch(type) {
				case Piece.PAWN: {
					return false;
				}

				case Piece.KNIGHT: {
					return ((diff.x === 2 && diff.y === 1) || (diff.x === 1 && diff.y === 2));
				}

				case Piece.BISHOP: {
					return (diff.x === diff.y);
				}

				case Piece.ROOK: {
					return (diff.x === 0 || diff.y === 0);
				}

				case Piece.QUEEN: {
					return (diff.x === diff.y || (diff.x === 0 || diff.y === 0));
				}

				case Piece.KING: {
					return ((diff.x === 1 || diff.x === 0) && (diff.y === 1 || diff.y === 0));
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

			return (toCoords.y - fromCoords.y === 1 && Math.abs(toCoords.x - fromCoords.x) === 1);
		},

		isPawnPromotion: function(relTo) {
			return (relTo > 55);
		},

		getEpPawn: function(capturerFrom, capturerTo) {
			return Chess.squareFromCoords({
				x: Chess.xFromSquare(capturerTo),
				y: Chess.yFromSquare(capturerFrom)
			});
		},

		getDiagonalDistance: function(fromCoords, toCoords) {
			return Math.abs(fromCoords.x - toCoords.x);
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
						x = relCoords.x + xDiff;
						y = relCoords.y + 1;

						if(x > -1 && x < 8 && y > -1 && y < 8) {
							squares.push(Chess.getRelativeSquare(Chess.squareFromCoords({
								x: x,
								y: y
							}), colour));
						}
					}

					break;
				}

				case Piece.KNIGHT: {
					var xDiffs = [-1, -1, 1, 1, -2, -2, 2, 2];
					var yDiffs = [-2, 2, -2, 2, 1, -1, 1, -1];
					var x, y;

					for(var i = 0; i < 8; i++) {
						x = fromCoords.x + xDiffs[i];
						y = fromCoords.y + yDiffs[i];

						if(x > -1 && x < 8 && y > -1 && y < 8) {
							squares.push(Chess.squareFromCoords({
								x: x,
								y: y
							}));
						}
					}

					break;
				}

				case Piece.BISHOP: {
					var diffs = [1, -1];
					var coords;

					for(var ix = 0; ix < diffs.length; ix++) {
						for(var iy = 0; iy < diffs.length; iy++) {
							coords = {
								x: fromCoords.x,
								y: fromCoords.y
							};

							while(true) {
								coords.x += diffs[ix];
								coords.y += diffs[iy];

								if(coords.x > -1 && coords.x < 8 && coords.y > -1 && coords.y < 8) {
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
						squareOnSameRank = (fromCoords.y * 8) + n;
						squareOnSameFile = fromCoords.x + (n * 8);

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
						x = fromCoords.x + xDiff;

						if(x > -1 && x < 8) {
							for(var yDiff = -1; yDiff < 2; yDiff++) {
								y = fromCoords.y + yDiff;

								if(y > -1 && y < 8) {
									squares.push(Chess.squareFromCoords({
										x: x,
										y: y
									}));
								}
							}
						}
					}

					//castling moves

					var xDiffs = [-2, 2];

					for(var i = 0; i < xDiffs.length; i++) {
						x = fromCoords.x + xDiffs[i];

						if(x > -1 && x < 8) {
							squares.push(Chess.squareFromCoords({
								x: x,
								y: fromCoords.y
							}));
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
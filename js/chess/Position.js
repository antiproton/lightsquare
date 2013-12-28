define(function(require) {
	require("chess/constants");
	var Fen=require("chess/Fen");
	var CastlingRights=require("chess/CastlingRights");
	var Board=require("chess/Board");
	var Colour=require("chess/Colour");
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");
	var Move=require("chess/Move");

	function Position(fen) {
		this.board=new Board();
		this.castlingRights=new CastlingRights();
		this.active=Piece.WHITE;
		this.epTarget=null;
		this.fiftymoveClock=0;
		this.fullmove=1;

		if(fen) {
			this.setFen(fen);
		}

		else {
			this.setFen(Fen.STARTING_FEN);
		}
	}

	Position.prototype.setFen=function(fenString) {
		var fen=new Fen(fenString);

		this.active=Colour.getCode(fen.active);
		this.castlingRights.setFenString(fen.castlingRights);

		if(fen.epTarget===Fen.NONE) {
			this.epTarget=null;
		}

		else {
			this.epTarget=Chess.squareFromAlgebraic(fen.epTarget);
		}

		this.fiftymoveClock=parseInt(fen.fiftymoveClock);
		this.fullmove=parseInt(fen.fullmove);

		this.board.setBoardArray(Fen.fenPositionToBoardArray(fen.position));
	}

	Position.prototype.getFen=function() {
		var fen=new Fen();

		fen.position=Fen.boardArrayToFenPosition(this.board.getBoardArray());
		fen.active=Colour.getFen(this.active);
		fen.castlingRights=this.castlingRights.getFenStringBySide();

		fen.epTarget=Fen.NONE;

		if(this.epTarget!==null) {
			fen.epTarget=Chess.algebraicFromSquare(this.epTarget);
		}

		fen.fiftymoveClock=this.fiftymoveClock.toString();
		fen.fullmove=this.fullmove.toString();

		return fen.toString();
	}

	Position.prototype.getAttackers=function(pieceType, square, colour) {
		if(pieceType===Piece.PAWN) {
			return this.getPawnAttackers(square, colour);
		}

		else if(pieceType===Piece.KING) {
			return this.getKingAttackers(square, colour);
		}

		else {
			return this.getRegularAttackers(pieceType, square, colour);
		}
	}

	Position.prototype.getPawnAttackers=function(square, colour) {
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

				if(this.board.getSquare(candidateSquare)===piece) {
					attackers.push(candidateSquare);
				}
			}
		}

		return attackers;
	}

	Position.prototype.getKingAttackers=function(square, colour) {
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

						if(this.board.getSquare(candidateSquare)===piece) {
							attackers.push(candidateSquare);
						}
					}
				}
			}
		}

		return attackers;
	}

	Position.prototype.getRegularAttackers=function(pieceType, square, colour) {
		var attackers=[];
		var piece=Piece.getPiece(pieceType, colour);
		var candidateSquares=Chess.getReachableSquares(pieceType, square, colour);
		var candidateSquare;

		for(var i=0; i<candidateSquares.length; i++) {
			candidateSquare=candidateSquares[i];

			if(this.board.getSquare(candidateSquare)===piece && !this.moveIsBlocked(square, candidateSquare)) {
				attackers.push(candidateSquare);
			}
		}

		return attackers;
	}

	Position.prototype.getAllAttackers=function(square, colour) {
		var attackers=[];
		var pieceTypes=[Piece.PAWN, Piece.KNIGHT, Piece.BISHOP, Piece.ROOK, Piece.QUEEN, Piece.KING];

		for(var i=0; i<pieceTypes.length; i++) {
			attackers=attackers.concat(this.getAttackers(pieceTypes[i], square, colour));
		}

		return attackers;
	}

	Position.prototype.copy=function() {
		return new Position(this.getFen());
	}

	Position.prototype.playerIsInCheck=function(colour) {
		return (this.getAllAttackers(
			this.board.kingPositions[colour],
			Chess.getOppColour(colour)
		).length>0);
	}

	Position.prototype.playerIsMated=function(colour) {
		return (this.playerIsInCheck(colour) && this.countLegalMoves(colour)===0);
	}

	Position.prototype.playerCanMate=function(colour) {
		var pieces=[];
		var bishops=[];
		var knights=[];

		pieces[Piece.KNIGHT]=0;
		pieces[Piece.BISHOP]=0;
		bishops[Piece.WHITE]=0;
		bishops[Piece.BLACK]=0;
		knights[Piece.WHITE]=0;
		knights[Piece.BLACK]=0;

		var piece;

		for(var square=0; square<64; square++) {
			piece=new Piece(this.board.getSquare(square));

			if(piece.type!==Piece.NONE && piece.type!==Piece.KING) {
				if(
					piece.colour===colour
					&& (piece.type===Piece.PAWN || piece.type===Piece.ROOK || piece.type===Piece.QUEEN)
				) {
					return true;
				}

				if(piece.type===Piece.BISHOP) {
					bishops[piece.colour]++;
					pieces[Piece.BISHOP]++;
				}

				if(piece.type===Piece.KNIGHT) {
					knights[piece.colour]++;
					pieces[Piece.KNIGHT]++;
				}
			}
		}

		return (
			(bishops[Piece.WHITE]>0 && bishops[Piece.BLACK]>0)
			|| (pieces[Piece.BISHOP]>0 && pieces[Piece.KNIGHT]>0)
			|| (pieces[Piece.KNIGHT]>2 && knights[colour]>0)
		);
	}

	Position.prototype.countLegalMoves=function(colour) {
		var legalMoves=0;
		var piece;

		for(var square=0; square<64; square++) {
			piece=this.board.getSquare(square);

			if(piece!==Piece.NONE && Piece.getColour(piece)===colour) {
				legalMoves+=this.getLegalMovesFrom(square).length;
			}
		}

		return legalMoves;
	}

	Position.prototype.getLegalMovesFrom=function(square) {
		var legalMoves=[];
		var piece, reachableSquares;

		if(this.board.getSquare(square)!==Piece.NONE) {
			piece=new Piece(this.board.getSquare(square));
			reachableSquares=Chess.getReachableSquares(piece.type, square, piece.colour);

			for(var i=0; i<reachableSquares.length; i++) {
				if((new Move(this, square, reachableSquares[i], Piece.QUEEN, true)).isLegal()) {
					legalMoves.push(reachableSquares[i]);
				}
			}
		}

		return legalMoves;
	}

	Position.prototype.moveIsBlocked=function(from, to) {
		var squares=Chess.getSquaresBetween(from, to);

		for(var i=0; i<squares.length; i++) {
			if(this.board.getSquare(squares[i])!==Piece.NONE) {
				return true;
			}
		}

		return false;
	}

	return Position;
});
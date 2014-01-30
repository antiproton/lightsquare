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
		this._board=new Board();
		this._castlingRights=new CastlingRights();
		this._activeColour=Piece.WHITE;
		this._epTarget=null;
		this._fiftymoveClock=0;
		this._fullmove=1;

		if(fen) {
			this.setFen(fen);
		}

		else {
			this.setFen(Fen.STARTING_FEN);
		}
	}
	
	Position.prototype.getBoard=function() {
		return this._board.getCopy();
	}
	
	Position.prototype.getSquare=function(square) {
		return this._board.getSquare(square);
	}
	
	Position.prototype.setSquare=function(square, piece) {
		this._board.setSquare(square, piece);
	}
	
	Position.prototype.getActiveColour=function() {
		return this._activeColour;
	}
	
	Position.prototype.getCastlingRightsBySide=function(colour, side) {
		return this._castlingRights.getBySide(colour, side);
	}
	
	Position.prototype.getCastlingRightsByFile=function(colour, file) {
		return this._castlingRights.getByFile(colour, file);
	}
	
	Position.prototype.getEpTarget=function() {
		return this._epTarget;
	}
	
	Position.prototype.getFiftymoveClock=function() {
		return this._fiftymoveClock;
	}
	
	Position.prototype.getFullmove=function() {
		return this._fullmove;
	}
	
	Position.prototype.setCastlingRightsBySide=function(colour, side, allow) {
		this._castlingRights.setBySide(colour, side, allow);
	}
	
	Position.prototype.setCastlingRightsByFile=function(colour, file, allow) {
		this._castlingRights.setByFile(colour, file, allow);
	}
	
	Position.prototype.setActiveColour=function(colour) {
		this._activeColour=colour;
	}
	
	Position.prototype.setEpTarget=function(square) {
		this._epTarget=square;
	}
	
	Position.prototype.setFullmove=function(fullmove) {
		this._fullmove=fullmove;
	}
	
	Position.prototype.incrementFullmove=function() {
		this._fullmove++;
	}
	
	Position.prototype.incrementFiftymoveClock=function() {
		this._fiftymoveClock++;
	}
	
	Position.prototype.resetFiftymoveClock=function() {
		this._fiftymoveClock=0;
	}

	Position.prototype.setFen=function(fenString) {
		var fen=new Fen(fenString);

		this._activeColour=Colour.getCode(fen.active);
		this._castlingRights.setFenString(fen.castlingRights);

		if(fen.epTarget===Fen.NONE) {
			this._epTarget=null;
		}

		else {
			this._epTarget=Chess.squareFromAlgebraic(fen.epTarget);
		}

		this._fiftymoveClock=parseInt(fen.fiftymoveClock);
		this._fullmove=parseInt(fen.fullmove);

		this._board.setBoardArray(Fen.boardArrayFromFenPosition(fen.position));
	}

	Position.prototype.getFen=function() {
		var fen=new Fen();

		fen.position=Fen.fenPositionFromBoardArray(this._board.getBoardArray());
		fen.active=Colour.getFen(this._activeColour);
		fen.castlingRights=this._castlingRights.getFenStringBySide();

		fen.epTarget=Fen.NONE;

		if(this._epTarget!==null) {
			fen.epTarget=Chess.algebraicFromSquare(this._epTarget);
		}

		fen.fiftymoveClock=this._fiftymoveClock.toString();
		fen.fullmove=this._fullmove.toString();

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

				if(this._board.getSquare(candidateSquare)===piece) {
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

						if(this._board.getSquare(candidateSquare)===piece) {
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

			if(this._board.getSquare(candidateSquare)===piece && !this.moveIsBlocked(square, candidateSquare)) {
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

	Position.prototype.getCopy=function() {
		return new Position(this.getFen());
	}

	Position.prototype.playerIsInCheck=function(colour) {
		return (this.getAllAttackers(
			this._board.getKingPosition(colour),
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
			piece=new Piece(this._board.getSquare(square));

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
			piece=this._board.getSquare(square);

			if(piece!==Piece.NONE && Piece.getColour(piece)===colour) {
				legalMoves+=this.getLegalMovesFromSquare(square).length;
			}
		}

		return legalMoves;
	}

	Position.prototype.getLegalMovesFromSquare=function(square) {
		var legalMoves=[];
		var piece, reachableSquares;

		if(this._board.getSquare(square)!==Piece.NONE) {
			piece=new Piece(this._board.getSquare(square));
			reachableSquares=Chess.getReachableSquares(piece.type, square, piece.colour);

			for(var i=0; i<reachableSquares.length; i++) {
				if((new Move(this, square, reachableSquares[i], Piece.QUEEN)).isLegal()) {
					legalMoves.push(reachableSquares[i]);
				}
			}
		}

		return legalMoves;
	}

	Position.prototype.moveIsBlocked=function(from, to) {
		var squares=Chess.getSquaresBetween(from, to);

		for(var i=0; i<squares.length; i++) {
			if(this._board.getSquare(squares[i])!==Piece.NONE) {
				return true;
			}
		}

		return false;
	}

	return Position;
});
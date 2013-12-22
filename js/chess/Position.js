define(function(require) {
	var Fen=require("chess/Fen");
	var CastlingRights=require("chess/CastlingRights");
	var Board=require("chess/Board");
	var Colour=require("chess/Colour");
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");
	var Move=require("chess/Move");

	function Class(fen) {
		this.castlingRights=new CastlingRights();
		this.board=new Board();
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

	Class.prototype.setFen=function(str) {
		var fen=Fen.fenToArray(str);

		this.active=Colour.getCode(fen[Fen.FIELD_ACTIVE]);
		this.castlingRights.setFenString(fen[Fen.FIELD_CASTLING]);

		if(fen[Fen.FIELD_EP]===Fen.NONE) {
			this.epTarget=null;
		}

		else {
			this.epTarget=Chess.squareFromAlgebraic(fen[Fen.FIELD_EP]);
		}

		this.fiftymoveClock=0;

		if(fen[Fen.FIELD_CLOCK]) {
			this.fiftymoveClock=parseInt(fen[Fen.FIELD_CLOCK]);
		}

		this.fullmove=1;

		if(fen[Fen.FIELD_FULLMOVE]) {
			this.fullmove=parseInt(fen[Fen.FIELD_FULLMOVE]);
		}

		this.board.setBoardArray(Fen.fenPositionToBoardArray(fen[Fen.FIELD_POSITION]));
	}

	Class.prototype.getFen=function() {
		return Fen.arrayToFen([
			Fen.boardArrayToFenPosition(this.board.getBoardArray()),
			Colour.getFen(this.active),
			this.castlingRights.getFenString(),
			(this.epTarget===null)?Fen.NONE:Chess.algebraicFromSquare(this.epTarget),
			this.fiftymoveClock.toString(),
			this.fullmove.toString()
		]);
	}

	Class.prototype.copy=function() {
		return new Class(this.getFen());
	}

	Class.prototype.playerIsInCheck=function(colour) {
		return (Chess.getAllAttackers(
			this.board.getBoardArray(),
			this.board.kingPositions[colour],
			Chess.getOppColour(colour)
		).length>0);
	}

	Class.prototype.playerIsMated=function(colour) {
		return (this.playerIsInCheck(colour) && this.countLegalMoves(colour)===0);
	}

	Class.prototype.canMate=function(colour) {
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

	Class.prototype.countLegalMoves=function(colour) {
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

	Class.prototype.getLegalMovesFrom=function(square) {
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

	return Class;
});
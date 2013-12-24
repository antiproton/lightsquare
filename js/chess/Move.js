define(function(require) {
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");
	var MoveLabel=require("chess/MoveLabel");

	function Move(positionBefore, from, to, promoteTo, justCheckingLegality) {
		this._positionBefore=positionBefore;
		this._from=from;
		this._to=to;
		this._promoteTo=promoteTo||Piece.QUEEN;
		this._justCheckingLegality=justCheckingLegality||false;
		this._positionAfter=this._positionBefore.copy();
		this._piece=new Piece(this._positionBefore.board.getSquare(this._from));
		this._targetPiece=new Piece(this._positionBefore.board.getSquare(this._to));
		this._colour=this.positionBefore.active;
		this._oppColour=Chess.getOppColour(this._colour);
		this._fromCoords=Chess.coordsFromSquare(this._from);
		this._toCoords=Chess.coordsFromSquare(this._to);
		this._relFrom=Chess.getRelativeSquare(this._from, this._colour);
		this._relTo=Chess.getRelativeSquare(this._to, this._colour);
		this._label=new MoveLabel();
		this._isCastling=false;
		this._capturedPiece=null;
		this._isUnobstructed=(
			!this._positionBefore.moveIsBlocked(this._from, this._to)
			&& (this._targetPiece.type===Piece.NONE || this._targetPiece.colour!==this._colour)
		);
		this._isValid=false;
		this._isLegal=false;

		this._check();
	}

	Move.prototype._check=function() {
		if(this._piece.type!==Piece.NONE && this._piece.colour===this._colour) {
			this._label.piece=Fen.getPieceChar(Piece.getPiece(this._piece.type, Piece.WHITE));
			this._label.to=Chess.getAlgebraicSquare(this._to);

			if(this._piece.type!==Piece.PAWN && this._piece.type!==Piece.KING) {
				this._label.disambiguation=this._getDisambiguationString();
			}

			if(targetPiece!==null && targetPiece.colour===this._oppColour) {
				this._label.sign=MoveLabel.SIGN_CAPTURE;
				this._capturedPiece=this._positionBefore.board.getSquare(this._to);
			}

			if(Chess.isRegularMove(this._piece.type, this._fromCoords, this._toCoords) && this._isUnobstructed) {
				this._isValid=true;
				this._positionAfter.board.setSquare(this._from, Piece.NONE);
				this._positionAfter.board.setSquare(this._to, this._positionBefore.board.getSquare(this._from));
			}

			else if(this._piece.type===Piece.PAWN && this._isUnobstructed) {
				this._checkPawnMove();
			}

			else if((this._piece.type===Piece.KING || this._piece.type===Piece.ROOK) && !this._positionBefore.playerIsInCheck(this._colour)) {
				this._checkCastlingMove();
			}

			if(this._isValid) {
				this._isLegal=!this._positionAfter.playerIsInCheck(this._colour);
			}

			if(this._justCheckingLegality) {
				this._positionAfter=this._positionBefore.copy();
			}

			else if(this._isLegal) {
				if(this._colour===Piece.BLACK) {
					this._positionAfter.fullmove++;
				}

				this._positionAfter.active=this._oppColour;

				if(this._capturedPiece!==null || this._piece.type===Piece.PAWN) {
					this._positionAfter.fiftymoveClock=0;
				}

				else {
					this._positionAfter.fiftymoveClock++;
				}

				if(this._piece.type!==Piece.PAWN || !Chess.isDoublePawnMove(this._relFrom, this._relTo)) {
					this._positionAfter.epTarget=null;
				}

				if(this._piece.type===Piece.KING || this._isCastling) {
					for(file=0; file<8; file++) {
						this._positionAfter.castlingRights.setByFile(this._colour, file, false);
					}
				}

				else if(this._piece.type===Piece.ROOK) {
					this._positionAfter.castlingRights.setByFile(this._colour, Chess.xFromSquare(this._from), false);
				}

				if(this.isMate()) {
					this._label.check=MoveLabel.SIGN_MATE;
				}

				else if(this.isCheck()) {
					this._label.check=MoveLabel.SIGN_CHECK;
				}
			}
		}
	}

	Move.prototype._checkPawnMove=function() {
		var capturing=Chess.isPawnCapture(this._relFrom, this._relTo);
		var validPromotion=false;
		var promotion=false;

		if(capturing) {
			this._label.disambiguation=Chess.fileFromSquare(this._from);
			this._label.sign=MoveLabel.SIGN_CAPTURE;
		}

		this._label.this._piece="";

		if(Chess.isPawnPromotion(this._relTo)) {
			promotion=true;

			if([Piece.KNIGHT, Piece.BISHOP, Piece.ROOK, Piece.QUEEN].indexOf(this._promoteTo)!==-1) {
				this._boardChanges[this._to]=Piece.getPiece(promoteTo, this._colour);
				this._label.special=MoveLabel.SIGN_PROMOTE+Fen.getPieceChar[Piece.getPiece(promoteTo, Piece.WHITE)];
				this._promoteTo=promoteTo;
				validPromotion=true;
			}
		}

		if(validPromotion || !promotion) {
			if(targetPiece===null) {
				if(Chess.isDoublePawnMove(this._relFrom, this._relTo)) {
					this._isValid=true;
					this._positionAfter.epTarget=Chess.getRelativeSquare(this._relTo-8, this._colour);
				}

				else if(Chess.isPawnMove(this._relFrom, this._relTo)) {
					this._isValid=true;
				}

				else if(capturing && this._to===this._positionBefore.epTarget) {
					this._isValid=true;
					this._boardChanges[Chess.getEpPawn(this._from, this._to)]=Piece.NONE;
					this._label.sign=MoveLabel.SIGN_CAPTURE;
					this._capturedPiece=Piece.getPiece(Piece.PAWN, this._oppColour);
				}
			}

			else if(capturing) {
				this._isValid=true;
			}
		}

		if(this._isValid) {
			this._boardChanges[this._from]=Piece.NONE;

			if(!promotion) {
				this._boardChanges[this._to]=this._positionBefore.board.getSquare(this._from);
			}
		}
	}

	Move.prototype._checkCastlingMove=function() {
		if(this._piece.type===Piece.KING && this._isUnobstructed) {
			var castling=new CastlingDetails(this._from, this._to);

			if(castling.isValid && this._positionBefore.castlingRights.get(this._colour, castling.side)) {
				var throughCheck=false;
				var between=Chess.getSquaresBetween(this._from, this._to);

				for(var i=0; i<between.length; i++) {
					if(this._positionBefore.getAllAttackers(between[i], this._oppColour).length>0) {
						throughCheck=true;

						break;
					}
				}

				if(!this._positionBefore.moveIsBlocked(this._from, castling.rookStartPos) && !throughCheck) {
					this._isValid=true;
					this._isCastling=true;
					this._label.piece="";
					this._label.to="";
					this._label.special=castling.sign;
					this._boardChanges[this._from]=Piece.NONE;
					this._boardChanges[this._to]=Piece.getPiece(Piece.KING, this._colour);
					this._boardChanges[castling.rookStartPos]=Piece.NONE;
					this._boardChanges[castling.rookEndPos]=Piece.getPiece(Piece.ROOK, this._colour);
				}
			}
		}
	}

	Move.prototype._getDisambiguationString=function() {
		var disambiguationString="";

		//FIXME these calls could be moved into Position probably (using position.board.getBoardArray and a util func ...)
		var piecesInRange=Chess.getAttackers(this._positionBefore.board.getBoardArray(), this._piece.type, this._to, this._colour);

		var disambiguation={
			file: "",
			rank: ""
		};

		var square;

		for(var i=0; i<piecesInRange.length; i++) {
			square=piecesInRange[i];

			if(square!==this._from) {
				if(Chess.xFromSquare(square)===Chess.xFromSquare(this._from)) {
					disambiguation.file=Chess.fileFromSquare(this._from);
				}

				if(Chess.yFromSquare(square)===Chess.yFromSquare(this._from)) {
					disambiguation.rank=Chess.rankFromSquare(this._from);
				}
			}
		}

		disambiguationString=disambiguation.file+disambiguation.rank;

		//if neither rank nor file is the same, specify file

		if(piecesInRange.length>1 && disambiguationString==="") {
			disambiguationString=Chess.fileFromSquare(this._from);
		}

		return disambiguationString;
	}

	Move.prototype.isCheck=function() {
		return this._positionAfter.playerIsInCheck(this._oppColour);
	}

	Move.prototype.isMate=function() {
		return (this.isCheck() && this._positionAfter.countLegalMoves(this._oppColour)===0);
	}

	Move.prototype.isCastling=function() {
		return this._isCastling;
	}

	Move.prototype.isLegal=function() {
		return this._isLegal;
	}

	Move.prototype.getFullmove=function() {
		return this._positionAfter.fullmove;
	}

	Move.prototype.getColour=function() {
		return this._colour;
	}

	Move.prototype.getDot=function() {
		var dot=[];

		dot[Piece.WHITE]=".";
		dot[Piece.BLACK]="...";

		return dot[this._colour];
	}

	Move.prototype.getLabel=function() {
		return this._label;
	}

	Move.prototype.getFullLabel=function() {
		return this.getFullmove()+this.getDot()+" "+this.getLabel();
	}

	return Move;
});
define(function(require) {
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");
	var MoveLabel=require("chess/MoveLabel");
	var Fen=require("chess/Fen");
	var CastlingDetails=require("chess/CastlingDetails");

	function Move(positionBefore, from, to, promoteTo) {
		this._positionBefore=positionBefore;
		this._from=from;
		this._to=to;
		this._promoteTo=promoteTo||Piece.QUEEN;
		this._positionAfter=this._positionBefore.getCopy();

		this._piece=new Piece(this._positionBefore.getSquare(this._from));
		this._targetPiece=new Piece(this._positionBefore.getSquare(this._to));
		this._capturedPiece=null;

		this._colour=this._positionBefore.getActiveColour();
		this._oppColour=Chess.getOppColour(this._colour);

		this._fromCoords=Chess.coordsFromSquare(this._from);
		this._toCoords=Chess.coordsFromSquare(this._to);
		this._relFrom=Chess.getRelativeSquare(this._from, this._colour);
		this._relTo=Chess.getRelativeSquare(this._to, this._colour);

		this._label=new MoveLabel();
		this._isCastling=false;

		this._isUnobstructed=(
			!this._positionBefore.moveIsBlocked(this._from, this._to)
			&& (this._targetPiece.type===Piece.NONE || this._targetPiece.colour===this._oppColour)
		);

		this._isValid=false;
		this._isLegal=false;

		this._isCheck=false;
		this._isMate=false;
		this._hasCheckedForCheck=false;
		this._hasCheckedForMate=false;

		this._check();
	}

	Move.prototype._check=function() {
		if(this._piece.type!==Piece.NONE && this._piece.colour===this._colour) {
			if(this._piece.type===Piece.PAWN) {
				this._checkPawnMove();
			}

			else if(this._piece.type===Piece.KING) {
				this._checkKingMove();
			}

			else {
				this._checkRegularMove();
			}

			this._isLegal=(this._isValid && !this._positionAfter.playerIsInCheck(this._colour));

			if(this._isLegal) {
				if(this._colour===Piece.BLACK) {
					this._positionAfter.incrementFullmove();
				}

				this._positionAfter.setActiveColour(this._oppColour);

				if(this._capturedPiece!==null || this._piece.type===Piece.PAWN) {
					this._positionAfter.resetFiftymoveClock();
				}

				else {
					this._positionAfter.incrementFiftymoveClock();
				}

				if(this._piece.type!==Piece.PAWN || !Chess.isDoublePawnMove(this._relFrom, this._relTo)) {
					this._positionAfter.setEpTarget(null);
				}

				if(this._piece.type===Piece.KING || this._isCastling) {
					for(file=0; file<8; file++) {
						this._positionAfter.setCastlingRightsByFile(this._colour, file, false);
					}
				}

				else if(this._piece.type===Piece.ROOK) {
					this._positionAfter.setCastlingRightsByFile(this._colour, Chess.xFromSquare(this._from), false);
				}
			}
		}
	}

	Move.prototype._checkRegularMove=function() {
			if(this._debug) {
				console.log("regular")
			}
		if(Chess.isRegularMove(this._piece.type, this._fromCoords, this._toCoords) && this._isUnobstructed) {
			this._isValid=true;
			this._positionAfter.setSquare(this._from, Piece.NONE);
			this._positionAfter.setSquare(this._to, this._positionBefore.getSquare(this._from));
			this._label.piece=Fen.getPieceChar(Piece.getPiece(this._piece.type, Piece.WHITE));
			this._label.to=Chess.algebraicFromSquare(this._to);

			if(this._piece.type!==Piece.KING) {
				this._label.disambiguation=this._getDisambiguationString();
			}

			if(this._targetPiece.type!==Piece.NONE && this._targetPiece.colour===this._oppColour) {
				this._label.sign=MoveLabel.SIGN_CAPTURE;
				this._capturedPiece=this._positionBefore.getSquare(this._to);
			}
		}
	}

	Move.prototype._checkPawnMove=function() {
		if(this._piece.type===Piece.PAWN && this._isUnobstructed) {
			var isCapturing=Chess.isPawnCapture(this._relFrom, this._relTo);
			var isEnPassant=false;
			var isDouble=false;
			var isPromotion=false;
			var isValidPromotion=false;

			if(Chess.isPawnPromotion(this._relTo)) {
				isPromotion=true;

				if([Piece.KNIGHT, Piece.BISHOP, Piece.ROOK, Piece.QUEEN].indexOf(this._promoteTo)!==-1) {
					isValidPromotion=true;
				}
			}

			if(isValidPromotion || !isPromotion) {
				if(this._targetPiece.type===Piece.NONE) {
					if(Chess.isDoublePawnMove(this._relFrom, this._relTo)) {
						this._isValid=true;
						isDouble=true;
					}

					else if(Chess.isPawnMove(this._relFrom, this._relTo)) {
						this._isValid=true;
					}

					else if(isCapturing && this._to===this._positionBefore.epTarget) {
						this._isValid=true;
						isEnPassant=true;
					}
				}

				else if(isCapturing) {
					this._isValid=true;
				}
			}

			if(this._isValid) {
				if(isCapturing) {
					this._label.disambiguation=Chess.fileFromSquare(this._from);
					this._label.sign=MoveLabel.SIGN_CAPTURE;

					if(isEnPassant) {
						this._positionAfter.setSquare(Chess.getEpPawn(this._from, this._to), Piece.NONE);
						this._capturedPiece=Piece.getPiece(Piece.PAWN, this._oppColour);
					}

					else {
						this._capturedPiece=this._positionBefore.getSquare(this._to);
					}
				}

				if(isDouble) {
					this._positionAfter.setEpTarget(Chess.getRelativeSquare(this._relTo-8, this._colour));
				}

				this._label.to=Chess.algebraicFromSquare(this._to);
				this._positionAfter.setSquare(this._from, Piece.NONE);

				if(isPromotion) {
					this._positionAfter.setSquare(this._to, Piece.getPiece(promoteTo, this._colour));
					this._label.special=MoveLabel.SIGN_PROMOTE+Fen.getPieceChar[Piece.getPiece(promoteTo, Piece.WHITE)];
				}

				else {
					this._positionAfter.setSquare(this._to, this._positionBefore.getSquare(this._from));
				}
			}
		}
	}

	Move.prototype._checkKingMove=function() {
		this._checkRegularMove();

		if(!this._isValid) {
			this._checkCastlingMove();
		}
	}

	Move.prototype._checkCastlingMove=function() {
		if(this._piece.type===Piece.KING && this._isUnobstructed && !this._positionBefore.playerIsInCheck(this._colour)) {
			var castling=new CastlingDetails(this._from, this._to);

			if(castling.isValid && this._positionBefore.getCastlingRightsBySide(this._colour, castling.side)) {
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
					this._label.special=castling.sign;
					this._positionAfter.setSquare(this._from, Piece.NONE);
					this._positionAfter.setSquare(this._to, Piece.getPiece(Piece.KING, this._colour));
					this._positionAfter.setSquare(castling.rookStartPos, Piece.NONE);
					this._positionAfter.setSquare(castling.rookEndPos, Piece.getPiece(Piece.ROOK, this._colour));
				}
			}
		}
	}

	Move.prototype._checkForCheck=function() {
		if(!this._hasCheckedForCheck) {
			this._isCheck=(this.isLegal() && this._positionAfter.playerIsInCheck(this._oppColour));

			if(this._isCheck) {
				this._label.check=MoveLabel.SIGN_CHECK;
			}

			this._hasCheckedForCheck=true;
		}
	}

	Move.prototype._checkForMate=function() {
		if(!this._hasCheckedForMate) {
			this._isMate=(this.isLegal() && this.isCheck() && this._positionAfter.countLegalMoves(this._oppColour)===0);

			if(this._isMate) {
				this._label.check=MoveLabel.SIGN_MATE;
			}

			this._hasCheckedForMate=true;
		}
	}

	Move.prototype._getDisambiguationString=function() {
		var disambiguationString="";
		var piecesInRange=this._positionBefore.getAttackers(this._piece.type, this._to, this._colour);

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

	Move.prototype.getPositionAfter=function() {
		return this._positionAfter.getCopy();
	}

	Move.prototype.getResultingFen=function() {
		return this._positionAfter.getFen();
	}

	Move.prototype.isCheck=function() {
		this._checkForCheck();

		return this._isCheck;
	}

	Move.prototype.isMate=function() {
		this._checkForMate();

		return this._isMate;
	}

	Move.prototype.isCastling=function() {
		return this._isCastling;
	}

	Move.prototype.isLegal=function() {
		return this._isLegal;
	}

	Move.prototype.getFullmove=function() {
		return this._positionBefore.getFullmove();
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
		this._checkForCheck();
		this._checkForMate();

		return this._label;
	}

	Move.prototype.getFullLabel=function() {
		return this.getFullmove()+this.getDot()+" "+this.getLabel();
	}

	return Move;
});
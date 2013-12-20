define(function(require) {
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");
	var MoveLabel=require("chess/MoveLabel");

	function Class(positionBefore, from, to, promoteTo) {
		this._positionBefore=positionBefore;
		this._from=from;
		this._to=to;
		this._promoteTo=promoteTo||Piece.QUEEN;
		this._positionAfter=this._positionBefore.copy();
		this._piece=new Piece(this._positionBefore.board.getSquare(this._from));
		this._targetPiece=new Piece(this._positionBefore.board.getSquare(this._to));
		this._colour=this.positionBefore.active;
		this._oppColour=Chess.getOppColour(this._colour);
		this._label=new MoveLabel();
		this._isCheck=false;
		this._isMate=false;
		this._isCastling=false;
		this._capturedPiece=null;
		this._isValid=false;
		this._isLegal=false;
		this._check();
	}

	Class.prototype._check=function() {

		var fromCoords=Chess.coordsFromSquare(this._from);
		var toCoords=Chess.coordsFromSquare(this._to);
		var relFrom=Chess.getRelativeSquare(this._from, this._colour);
		var relTo=Chess.getRelativeSquare(this._to, this._colour);

		if(piece.type!==Piece.NONE && piece.colour===this._colour) {
			var isUnobstructed=(
				!this._positionBefore.pathIsBlocked(this._from, this._to)
				&& (targetPiece.type===Piece.NONE || targetPiece.colour!==this._colour)
			);

			this._label.piece=Fen.getPieceChar(Piece.getPiece(piece.type, Piece.WHITE));
			this._label.to=Chess.getAlgebraicSquare(this._to);

			if(piece.type!==Piece.PAWN && piece.type!==Piece.KING) {
				this._label.disambiguation=this._getDisambiguationString();
			}

			if(targetPiece!==null && targetPiece.colour===oppColour) {
				this._label.sign=MoveLabel.SIGN_CAPTURE;
				this._capturedPiece=this._positionBefore.board.getSquare(this._to);
			}

			if(Chess.isRegularMove(piece.type, fromCoords, toCoords) && isUnobstructed) {
				this._isValid=true;
				this._positionAfter.board.setSquare(this._from, Piece.NONE);
				this._positionAfter.board.setSquare(this._to, this._positionBefore.board.getSquare(this._from));
			}

			else if(piece.type===Piece.PAWN && isUnobstructed) {
				this._checkPawnMove();
			}

			else if((piece.type===Piece.KING || piece.type===Piece.ROOK) && !this._positionBefore.playerIsInCheck(this._colour)) {
				this._checkCastlingMove();
			}

			if(this._isValid) {
				var action;

				for(var square in this._boardChanges) {
					square=parseInt(square);
					this._positionBefore.board.setSquare(square, this._boardChanges[square]);
				}

				//test whether the player is in check on temporary board

				var playerKingAttackers=Chess.getAllAttackers(
					this._positionBefore.board.getBoardArray(),
					this._positionBefore.board.kingPositions[this._colour],
					oppColour
				);

				if(playerKingAttackers.length===0) {
					this._isLegal=true;
				}
			}

			if(this._isLegal) {
				if(this._colour===Piece.BLACK) {
					this._positionBefore.fullmove++;
				}

				this._positionBefore.active=oppColour;

				if(this._capturedPiece!==null || piece.type===Piece.PAWN) {
					this.positionAfter.fiftymoveClock=0;
				}

				else {
					this.positionAfter.fiftymoveClock++;
				}

				if(piece.type!==Piece.PAWN || !Chess.isDoublePawnMove(relFrom, relTo)) {
					this._positionBefore.epTarget=null;
				}

				if(piece.type===Piece.KING || this._isCastling) {
					for(file=0; file<8; file++) {
						this._positionBefore.castlingRights.setByFile(this._colour, file, false);
					}
				}

				else if(piece.type===Piece.ROOK) {
					this._positionBefore.castlingRights.setByFile(this._colour, Chess.xFromSquare(this._from), false);
				}

				if(this.isInCheck(oppColour)) {
					this._label.check=MoveLabel.SIGN_CHECK;
				}

				if(this.isMated(oppColour)) {
					this._label.check=MoveLabel.SIGN_MATE;
				}
			}
		}
	}

	Class.prototype._checkPawnMove=function() {
		var capturing=Chess.isPawnCapture(relFrom, relTo);
		var validPromotion=false;
		var promotion=false;

		if(capturing) {
			this._label.disambiguation=Chess.file_str(this._from);
			this._label.sign=MoveLabel.SIGN_CAPTURE;
		}

		this._label.piece="";

		if(Chess.isPawnPromotion(relTo)) {
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
				if(Chess.isDoublePawnMove(relFrom, relTo)) {
					this._isValid=true;
					this._positionAfter.epTarget=Chess.getRelativeSquare(relTo-8, this._colour);
				}

				else if(Chess.isPawnMove(relFrom, relTo)) {
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

	Class.prototype._checkCastlingMove=function() {
		this._isCastling=true;

		/*
		FIXME can this be done without Move knowing the variant?  yes; if castling rights and the
		rook/king aren't on standard home squares, then it's 960.  if they are it might also be
		960 but might not, so this would allow king captures rook to castle etc. or could tell
		players that you have to castle normall if they are on normal squares...
		*/

		if(false /* something */) {
			this._check960CastlingMove();
		}

		else {
			this._checkStandardCastlingMove();
		}
	}

	Class.prototype._check960CastlingMove=function() {
		var backrank=[0, 7][this._colour];

		if(Chess.yFromSquare(this._from)===backrank && Chess.yFromSquare(this._to)===backrank) {
			kingSquare=this._positionBefore.kingPositions[this._colour];
			rookSquare=null;

			//find out whether it's kingside or queenside based on move direction

			var side;

			if(piece.type===Piece.ROOK) {
				side=(Chess.xFromSquare(this._from)<Chess.xFromSquare(this._to))?CastlingRights.QUEENSIDE:CastlingRights.KINGSIDE;
			}

			else if(piece.type===Piece.KING) {
				side=(Chess.xFromSquare(this._from)>Chess.xFromSquare(this._to))?CastlingRights.QUEENSIDE:CastlingRights.KINGSIDE;
			}

			var rookDestinationFile=[5, 3][side];
			var kingDestinationFile=[6, 2][side];
			var edge=[7, 0][side];

			//if rook move, rook is on this._from square

			if(piece.type===Piece.ROOK) {
				rookSquare=this._from;
			}

			//if king move, find rook between edge and king

			else {
				var rookSquares=Chess.getSquaresBetween(Chess.squareFromCoords([edge, backrank]), kingSquare, true);
				var sq;

				for(var i=0; i<rookSquares.length; i++) {
					sq=rookSquares[i];

					if(this._positionBefore.board.getSquare(sq)===Piece.getPiece(Piece.ROOK, this._colour)) {
						rookSquare=sq;

						break;
					}
				}
			}

			/*
			this bit finds out which squares to check to see that the only 2 pieces
			on the bit of the back rank used for castling are the king and the rook
			*/

			if(rookSquare!==null) {
				var kingDestination=Chess.squareFromCoords([kingDestinationFile, backrank]);
				var rookDestination=Chess.squareFromCoords([rookDestinationFile, backrank]);

				var outermostSquare=kingSquare;
				var innermostSquare=rookSquare;

				var kingFile=Chess.xFromSquare(kingSquare);
				var rookFile=Chess.xFromSquare(rookSquare);

				if(Math.abs(edge-rookDestinationFile)>Math.abs(edge-kingFile)) { //rook dest is further out
					outermostSquare=rookDestination;
				}

				if(Math.abs(edge-kingDestinationFile)<Math.abs(edge-rookFile)) { //king dest is further in
					innermostSquare=kingDestination;
				}

				var squares=Chess.getSquaresBetween(innermostSquare, outermostSquare, true);

				var kings=0;
				var rooks=0;
				var others=0;
				var pc;

				for(var i=0; i<squares.length; i++) {
					sq=squares[i];
					pc=this._positionBefore.board.getSquare(sq);

					if(pc!==Piece.NONE) {
						if(pc===Piece.getPiece(Piece.ROOK, this._colour)) {
							rooks++;
						}

						else if(pc===Piece.getPiece(Piece.KING, this._colour)) {
							kings++;
						}

						else {
							others++;

							break;
						}
					}
				}

				if(kings===1 && rooks===1 && others===0) {
					var throughCheck=false;
					var between=Chess.getSquaresBetween(kingSquare, kingDestination);
					var n;

					for(var i=0; i<between.length; i++) {
						n=between[i];

						if(Chess.getAllAttackers(this._positionBefore.board.getBoardArray(), n, oppColour).length>0) {
							throughCheck=true;

							break;
						}
					}

					if(!throughCheck) {
						this._isValid=true;
						this._label.piece="";
						this._label.to="";
						this._label.special=CastlingDetails.signs[side];
						this._boardChanges[kingSquare]=Piece.NONE;
						this._boardChanges[rookSquare]=Piece.NONE;
						this._boardChanges[kingDestination]=Piece.getPiece(Piece.KING, this._colour);
						this._boardChanges[rookDestination]=Piece.getPiece(Piece.ROOK, this._colour);
					}
				}
			}
		}
	}

	Class.prototype._checkStandardCastlingMove=function() {
		if(piece.type===Piece.KING && isUnobstructed) {
			var castling=new CastlingDetails(this._from, this._to);

			if(castling.isValid && this._positionBefore.castlingRights.get(this._colour, castling.Side)) {
				var throughCheck=false;
				var between=Chess.getSquaresBetween(this._from, this._to);

				for(var i=0; i<between.length; i++) {
					if(Chess.getAllAttackers(
						this._positionBefore.board.getBoardArray(),
						between[i],
						oppColour
					).length>0) {
						throughCheck=true;

						break;
					}
				}

				if(!Chess.isBlocked(
					this._positionBefore.board.getBoardArray(),
					this._from,
					castling.rookStartPos
				) && !throughCheck) {
					this._isValid=true;
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

	Class.prototype.isCheck=function() {
		return this._isCheck;
	}

	Class.prototype.isMate=function() {
		return this._isMate;
	}

	Class.prototype.isCastling=function() {
		return this._isCastling;
	}

	Class.prototype.isLegal=function() {
		return this._isLegal;
	}

	Class.prototype.getFullmove=function() {
		var fullmove=this._positionBefore.fullmove;

		if(this._colour===Piece.WHITE) {
			fullmove++;
		}

		return fullmove;
	}

	Class.prototype.getColour=function() {
		return this._colour;
	}

	Class.prototype.getDot=function() {
		var dot=[];

		dot[Piece.WHITE]=".";
		dot[Piece.BLACK]="...";

		return dot[this._colour];
	}

	Class.prototype.getLabel=function() {
		return this._label;
	}

	Class.prototype.getFullLabel=function() {
		return this.getFullmove()+this.getDot()+" "+this.getLabel();
	}

	return Class;
});
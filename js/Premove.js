define(function(require) {
	var PieceType = require("chess/PieceType");
	var Square = require("chess/Square");
	var Piece = require("chess/Piece");
	
	function Premove(position, from, to, promoteTo) {
		this._isValid = false;
		this._position = position.getCopy();
		this._from = from;
		this._to = to;
		this._promoteTo = promoteTo || PieceType.queen;
		this._piece = this._position.getPiece(this._from);
		
		if(this._piece !== null) {
			this._colour = this._piece.colour;
			this._fromRelative = this._from.adjusted[this._colour];
			this._toRelative = this._to.adjusted[this._colour];
			this._isPromotion = false;
			this._check();
		}
	}
	
	Premove.prototype.isValid = function() {
		return this._isValid;
	}
	
	Premove.prototype.getBoardArray = function() {
		return this._position.getBoardArray();
	}
	
	Premove.prototype._check = function() {
		if(this._piece.type === PieceType.pawn) {
			this._checkPawnMove();
		}

		else if(this._piece.type === PieceType.king) {
			this._checkKingMove();
		}

		else {
			this._checkRegularMove();
		}
		
		if(this._isValid) {
			this._position.setPiece(this._from, null);
			this._position.setPiece(this._to, this._piece);
		}
	}
	
	Premove.prototype._checkRegularMove = function() {
		this._isValid = this._isRegularShape();
	}
	
	Premove.prototype._isRegularShape = function() {
		var diff = {
			x: Math.abs(this._from.coords.x - this._to.coords.x),
			y: Math.abs(this._from.coords.y - this._to.coords.y)
		};

		if(diff.x === 0 && diff.y === 0) {
			return false;
		}

		switch(this._piece.type) {
			case PieceType.knight: {
				return ((diff.x === 2 && diff.y === 1) || (diff.x === 1 && diff.y === 2));
			}

			case PieceType.bishop: {
				return (diff.x === diff.y);
			}

			case PieceType.rook: {
				return (diff.x === 0 || diff.y === 0);
			}

			case PieceType.queen: {
				return (diff.x === diff.y || (diff.x === 0 || diff.y === 0));
			}

			case PieceType.king: {
				return ((diff.x === 1 || diff.x === 0) && (diff.y === 1 || diff.y === 0));
			}
		}
	}
	
	Premove.prototype._checkPawnMove = function() {
		this._isValid = (
			(this._isPawnShape() || this._isPawnCaptureShape() || this._isDoublePawnShape())
			&& this._promoteTo.isValidPromotion
		);
		
		if(this._isValid) {
			this._isPromotion = this._to.isPromotionRank;
		}
	}
	
	Premove.prototype._isPawnShape = function() {
		return (
			this._toRelative.coords.y - this._fromRelative.coords.y === 1
			&& this._to.coords.x === this._from.coords.x
		);
	}
	
	Premove.prototype._isPawnCaptureShape = function() {
		return (
			this._toRelative.coords.y - this._fromRelative.coords.y === 1
			&& Math.abs(this._to.coords.x - this._from.coords.x) === 1
		);
	}
	
	Premove.prototype._isDoublePawnShape = function() {
		return (
			this._fromRelative.coords.y === 1
			&& this._toRelative.coords.y === 3
			&& this._to.coords.x === this._from.coords.x
		);
	}
	
	Premove.prototype._checkKingMove = function() {
		this._checkRegularMove();

		if(!this._isValid) {
			this._checkCastlingMove();
		}
	}

	Premove.prototype._checkCastlingMove = function() {
		var file = (this._to.squareNo < this._from.squareNo ? "a" : "h");
		var rookOriginX = (file === "a" ? 0 : 7);
		var rookDestinationX = (file === "a" ? 3 : 5);
		var rookOrigin = Square.fromCoords(new Coords(rookOriginX, this._from.coords.y));
		var rookDestination = Square.fromCoords(new Coords(rookDestinationX, this._from.coords.y));
		
		if(
			Math.abs(this._to.coords.x - this._from.coords.x) === 2
			&& !this._position.moveIsBlocked(this._from, this._to)
			&& this._position.getCastlingRights(this._colour, file)
			&& this._position.getPiece(rookOrigin) === Piece.get(PieceType.rook, this._colour)
		) {
			this._isValid = true;
			this._position.setPiece(rookOrigin, null);
			this._position.setPiece(rookDestination, Piece.get(PieceType.rook, this._colour));
		}
	}
	
	return Premove;
});
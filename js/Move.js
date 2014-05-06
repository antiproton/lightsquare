define(function(require) {
	var Position = require("chess/Position");
	var PieceType = require("chess/PieceType");
	var Piece = require("chess/Piece");
	var Colour = require("chess/Colour");
	
	function Move(details) {
		this._details = details;
	}
	
	Move.prototype.getLabel = function() {
		return this._details.label;
	}
	
	Move.prototype.getFullLabel = function() {
		return this._details.fullLabel;
	}
	
	Move.prototype.getColour = function() {
		return Colour.fromFenString(this._details.colour);
	}
	
	Move.prototype.getFullmove = function() {
		return this._details.fullmove;
	}
	
	Move.prototype.getCapturedPiece = function() {
		return (this._details.capturedPiece ? Piece.fromFenString(this._details.capturedPiece) : null);
	}
	
	Move.prototype.isCheck = function() {
		return this._details.isCheck;
	}
	
	Move.prototype.isMate = function() {
		return this._details.isMate;
	}
	
	Move.prototype.isCastling = function() {
		return this._details.isCastling;
	}
	
	Move.prototype.isPromotion = function() {
		return this._details.isPromotion;
	}
	
	Move.prototype.getPromoteTo = function() {
		return (this._details.promoteTo ? PieceType.fromSanString(this._details.promoteTo) : null);
	}
	
	Move.prototype.getPositionAfter = function() {
		return new Position(this._details.resultingFen);
	}
	
	Move.prototype.getTime = function() {
		return this._details.time;
	}
	
	Move.prototype.setTime = function(time) {
		this._details.time = time;
	}
	
	Move.prototype.isLegal = function() {
		return true;
	}
	
	Move.prototype.toJSON = function() {
		return this._details;
	}
	
	return {
		fromJSON: function(json) {
			return new Move(json);
		},
		
		fromMove: function(move) {
			var capturedPiece = move.getCapturedPiece();
			var promoteTo = move.getPromoteTo();
			
			if(move.isLegal()) {
				return new Move({
					label: move.getLabel(),
					fullLabel: move.getFullLabel(),
					colour: move.getColour().fenString,
					fullmove: move.getFullmove(),
					isCheck: move.isCheck(),
					isMate: move.isMate(),
					isCastling: move.isCastling(),
					isPromotion: move.isPromotion(),
					promoteTo: (promoteTo ? promoteTo.sanString : null),
					resultingFen: move.getPositionAfter().getFen(),
					capturedPiece: (capturedPiece ? capturedPiece.fenString : null),
					time: move.getTime()
				});
			}
		}
	};
});
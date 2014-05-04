define(function(require) {
	var Colour = require("chess/Colour");

	function Fullmove() {
		this._moves = {};
		this._moves[Colour.white] = null;
		this._moves[Colour.black] = null;
	}

	Fullmove.prototype.add = function(move) {
		this._moves[move.getColour()] = move;
	}

	Fullmove.prototype.remove = function(move) {
		this._moves[move.getColour()] = null;
	}

	Fullmove.prototype.isEmpty = function() {
		return (this._moves[Colour.white] === null && this._moves[Colour.black] === null);
	}

	Fullmove.prototype.getLastMove = function() {
		return (this._moves[Colour.white] || this._moves[Colour.black]);
	}

	return Fullmove;
});
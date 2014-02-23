define(function(require) {
	var Template = require("lib/dom/Template");
	var html = require("file@./resources/fullmove.html");
	var Piece = require("chess/Piece");
	require("css@./resources/fullmove.css");

	function Fullmove(parent, fullmove) {
		this._fullmove = fullmove;

		this._moves = [];
		this._moves[Piece.WHITE] = null;
		this._moves[Piece.BLACK] = null;

		this._template = new Template(html, parent);
		this._setupTemplate();
	}
	
	Fullmove.prototype.removeNode = function() {
		this._template.root.parentNode.removeChild(this._template.root);
	}

	Fullmove.prototype._setupTemplate = function() {
		this._fullmoveCol = this._template.fullmove_col;
		this._fullmoveCol.innerHTML = this._fullmove;
		this._colourCols = [];
		this._colourCols[Piece.WHITE] = this._template.white_col;
		this._colourCols[Piece.BLACK] = this._template.black_col;
	}

	Fullmove.prototype.add = function(move) {
		var colour = move.getColour();

		this._colourCols[colour].appendChild(move.node);
		this._moves[colour] = move;

		move.setParentFullmove(this);
	}

	Fullmove.prototype.remove = function(move) {
		var colour = move.getColour();

		this._colourCols[colour].removeNode(move.node);
		this._moves[colour] = null;
	}

	Fullmove.prototype.isEmpty = function() {
		return (this._moves[Piece.WHITE] === null && this._moves[Piece.BLACK] === null);
	}

	Fullmove.prototype.getLastMove = function() {
		return (this._moves[Piece.WHITE] || this._moves[Piece.BLACK]);
	}

	return Fullmove;
});
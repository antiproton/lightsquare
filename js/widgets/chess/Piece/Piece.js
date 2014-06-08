define(function(require) {
	var Template = require("lib/dom/Template");
	var html = require("file!./piece.html");
	var style = require("lib/dom/style");
	var Fen = require("chess/Fen");

	function Piece(parent, size) {
		this._template = new Template(html, parent);
		this._style = "Merida";
		this._piece = null;
		this._size = size || Piece.DEFAULT_SIZE;
		this._setupHtml();
	}

	Piece.styles = [
		"Alpha",
		"Merida"
	];

	Piece.DEFAULT_SIZE = 60;

	Piece.prototype.setPiece = function(piece) {
		this._piece = piece;
		this._updatePiece();
	}
	
	Piece.prototype.getPiece = function() {
		return this._piece;
	}

	Piece.prototype._updatePiece = function() {
		var offset = (this._piece ? "PNBRQKpnbrqk".indexOf(this._piece) * this._size : -this._size);
		
		this._template.root.style.backgroundPosition = offset + "px 0";
	}

	Piece.prototype.setStyle = function(style) {
		this._style = style;
		this._updatePieceSet();
	}

	Piece.prototype.setSize = function(size) {
		this._size = size;
		this._updatePieceSet();
	}
	
	Piece.prototype._updatePieceSet = function() {
		var path = [
			".",
			"pieces",
			this._style,
			this._size,
			"sprite.png"
		];
		
		this._template.root.style.backgroundImage = "url('" + require.toUrl(path.join("/")) + "')";
	}

	return Piece;
});
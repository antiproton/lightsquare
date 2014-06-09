define(function(require) {
	var Template = require("lib/dom/Template");
	var html = require("file!./piece.html");
	var style = require("lib/dom/style");
	var Fen = require("chess/Fen");

	function Piece(parent, size) {
		this._template = new Template(html, parent);
		this._style = Piece.DEFAULT_STYLE;
		this._piece = null;
		this._size = size || Piece.DEFAULT_SIZE;
		this._updateSprite();
	}

	Piece.styles = [
		"Alpha",
		"Classic"
	];
	
	Piece.sizes = {
		"Tiny": 20,
		"Extra small": 30,
		"Small": 45,
		"Standard": 60,
		"Large": 75,
		"Extra large": 90
	};

	Piece.DEFAULT_SIZE = 60;
	Piece.DEFAULT_STYLE = "Classic";

	Piece.prototype.setPiece = function(piece) {
		this._piece = piece;
		this._updateSprite();
	}
	
	Piece.prototype.getPiece = function() {
		return this._piece;
	}

	Piece.prototype.setStyle = function(style) {
		this._style = style;
		this._updateSprite();
	}

	Piece.prototype.setSize = function(size) {
		this._size = size;
		this._updateSprite();
	}
	
	Piece.prototype._updateSprite = function() {
		var offset = this._size;
		
		if(this._piece !== null) {
			offset = -"PNBRQKpnbrqk".indexOf(this._piece) * this._size;
		}
		
		var path = [
			".",
			"pieces",
			this._style,
			this._size,
			"sprite.png"
		];
		
		style(this._template.root, {
			width: this._size,
			height: this._size,
			backgroundImage: "url('" + require.toUrl(path.join("/")) + "')",
			backgroundPosition: offset + "px 0",
			backgroundRepeat: "no-repeat"
		});
	}

	return Piece;
});
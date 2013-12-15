define(function(require, exports, module) {
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/piece.html");
	var style=require("lib/dom/style");
	var Fen=require("chess/Fen");

	function Piece(parent, size) {
		this._template=new Template(html, parent);
		this._style="Merida";
		this._piece=SQ_EMPTY;
		this._size=size||Piece.DEFAULT_SIZE;
		this._setupHtml();
	}

	Piece.styles=[
		"Alpha",
		"Merida"
	];

	Piece.DEFAULT_SIZE=90;

	Piece.prototype._setupHtml=function() {
		this._updateHtml();
	}

	Piece.prototype._updateHtml=function() {
		style(this._template.root, {
			width: this._size,
			height: this._size
		});

		this._updatePiece();
	}

	Piece.prototype.setPiece=function(piece) {
		this._piece=piece;
		this._updatePiece();
	}

	Piece.prototype._updatePiece=function() {
		var backgroundImage="none";
		var path;

		if(this._piece!==SQ_EMPTY) {
			path=[
				module.path,
				"resources",
				"pieces",
				this._style,
				this._size,
				Fen.getPieceChar(this._piece)+".png"
			];

			backgroundImage="url("+path.join("/")+")";
		}

		if(this._template.root.style.backgroundImage!==backgroundImage) {
			this._template.root.style.backgroundImage=backgroundImage;
		}
	}

	Piece.prototype.setStlye=function(style) {
		this._style=style;
		this._updatePiece();
	}

	Piece.prototype.setSize=function(size) {
		this._size=size;
		this._updateHtml();
	}

	return Piece;
});
define(function(require) {
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/piece.html");
	var style=require("lib/dom/style");
	var Fen=require("chess/Fen");
	var Piece=require("chess/Piece");

	function Class(parent, size) {
		this._template=new Template(html, parent);
		this._style="Merida";
		this._piece=Piece.NONE;
		this._size=size||Class.DEFAULT_SIZE;
		this._setupHtml();
	}

	Class.styles=[
		"Alpha",
		"Merida"
	];

	Class.DEFAULT_SIZE=60;

	Class.prototype._setupHtml=function() {
		this._updateHtml();
	}

	Class.prototype._updateHtml=function() {
		style(this._template.root, {
			width: this._size,
			height: this._size
		});

		this._updatePiece();
	}

	Class.prototype.setPiece=function(piece) {
		this._piece=piece;
		this._updatePiece();
	}

	Class.prototype._updatePiece=function() {
		var backgroundImage="none";
		var path;

		if(this._piece!==Piece.NONE) {
			path=[
				".",
				"resources",
				"pieces",
				this._style,
				this._size,
				Fen.getPieceChar(this._piece)+".png"
			];

			backgroundImage="url("+require.toUrl(path.join("/"))+")";
		}

		if(this._template.root.style.backgroundImage!==backgroundImage) {
			this._template.root.style.backgroundImage=backgroundImage;
		}
	}

	Class.prototype.setStlye=function(style) {
		this._style=style;
		this._updatePiece();
	}

	Class.prototype.setSize=function(size) {
		this._size=size;
		this._updateHtml();
	}

	return Class;
});
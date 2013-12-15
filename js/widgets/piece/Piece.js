define(function(require, exports, module) {
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/piece.html");

	function Piece(parent) {
		this._template=new Template(parent, html);
		this._piece=SQ_EMPTY;
	}

	Piece.prototype.setPiece=function(piece) {
		var backgroundImage="none";
		var path;

		if(this._piece!==SQ_EMPTY) {
			path=[
				this._pieceDir,
				this._pieceStyle,
				this._size,
				Fen.getPieceChar(this._piece)+".png"
			];

			backgroundImage="url("+path.join("/")+")";
		}

		if(this._template.piece.style.backgroundImage!==backgroundImage) {
			this._template.piece.style.backgroundImage=backgroundImage;
		}
	}

	Piece.prototype.setStlye=function(style) {
		this._style=style;
	}

	Piece.prototype.setSize=function(size) {
		this._size=size;
	}

	return Piece;
});
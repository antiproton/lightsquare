function UiBoardSquare(parent, square, size, pieceStyle, pieceDir) {
	this._template=new Template("board_square", parent);
	this._square=square;
	this._size=size;
	this._pieceStyle=pieceStyle;
	this._pieceDir=pieceDir;
	this._piece=SQ_EMPTY;

	this.MouseDown=new Event(this);
	this.MouseUp=new Event(this);

	this._setupHtml();
}

UiBoardSquare.prototype.setSize=function(size) {
	this._size=size;
	this._updateSize();
	this._updatePiece();
}

UiBoardSquare.prototype.setPiece=function(piece) {
	this._piece=piece;
	this._updatePiece();
}

UiBoardSquare.prototype.setPieceStyle=function(pieceStyle) {
	this._pieceStyle=pieceStyle;
	this._updatePiece();
}

UiBoardSquare.prototype.setPieceDir=function(pieceDir) {
	this._pieceDir=pieceDir;
	this._updatePiece();
}

UiBoardSquare.prototype.setZIndex=function(zIndex) {
	this._template.root.style.zIndex=zIndex;
}

UiBoardSquare.prototype.setRootPosition=function(x, y) {
	style(this._template.root, {
		top: y,
		left: x
	});
}

UiBoardSquare.prototype.setPiecePosition=function(x, y) {
	var offsets=getoffsets(this._template.root);

	style(this._template.piece, {
		top: y-offsets[Y],
		left: x-offsets[X]
	});
}

UiBoardSquare.prototype.resetPiecePosition=function() {
	style(this._template.piece, {
		top: 0,
		left: 0
	});
}

UiBoardSquare.prototype._setupHtml=function() {
	var self=this;
	var colourName=Colour.getName(Util.getSquareColour(this._square));

	this._template.root.classList.add("board_square_"+colourName);

	this._template.piece.addEventListener("mousedown", function(e) {
		self.MouseDown.fire({
			event: e
		});
	});

	this._template.piece.addEventListener("mouseup", function(e) {
		self.MouseUp.fire({
			event: e
		});
	});

	this._updateSize();
}

UiBoardSquare.prototype.getOffsets=function() {
	return getoffsets(this._template.root);
}

UiBoardSquare.prototype._updatePiece=function() {
	var backgroundImage="none";

	if(this._piece!==SQ_EMPTY) {
		backgroundImage="url("+this._pieceDir+"/"+this._pieceStyle+"/"+this._size+"/"+Fen.getPieceChar(this._piece)+".png)";
	}

	if(this._template.piece.style.backgroundImage!==backgroundImage) {
		this._template.piece.style.backgroundImage=backgroundImage;
	}
}

UiBoardSquare.prototype._updateSize=function() {
	var css={
		width: this._size,
		height: this._size
	};

	style(this._template.root, css);
	style(this._template.highlight, css);
	style(this._template.piece, css);
}
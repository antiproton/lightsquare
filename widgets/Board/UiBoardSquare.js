function UiBoardSquare(parent, square, size, pieceStyle, pieceDir) {
	this._template=new Template("board_square", parent);
	this._square=square;
	this._size=size;
	this._pieceStyle=pieceStyle;
	this._pieceDir=pieceDir;

	this.MouseDown=new Event(this);
	this.MouseUp=new Event(this);

	this.size=setter(this, function() {
		return this._size;
	}, function(value) {
		if(this._size!==value) {
			this._size=value;
			this._updateHtml();
		}
	});

	this.pieceStyle=setter(this, function() {
		return this._pieceStyle;
	}, function(value) {
		if(this._pieceStyle!==value) {
			this._pieceStyle=value;
			this._updateHtml();
		}
	});

	this.pieceDir=setter(this, function() {
		return this._pieceDir;
	}, function(value) {
		if(this._pieceDir!==value) {
			this._pieceDir=value;
			this._updateHtml();
		}
	});

	this._setupHtml();
}

UiBoardSquare.prototype._setupHtml=function() {
	var self=this;
	var colourName=Colour.getName(Util.getSquareColour(this.square));

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
}

UiBoardSquare.prototype.getOffsets=function() {
	return getoffsets(this._template.root);
}

UiBoardSquare.prototype.setZIndex=function(zIndex) {
	this._template.root.style.zIndex=zIndex;
}

UiBoardSquare.prototype.setPiece=function(piece, style) {
	var backgroundImage="none";

	if(piece!==SQ_EMPTY) {
		backgroundImage="url("+this._pieceDir+"/"+this._pieceStyle+"/"+this._size+"/"+Fen.getPieceChar(piece)+".png)";
	}

	if(this._template.piece.style.backgroundImage!==backgroundImage) {
		this._template.piece.style.backgroundImage=backgroundImage;
	}
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

UiBoardSquare.prototype.setSize=function(size) {
	var css={
		width: size,
		height: size
	};

	style(this._template.root, css);
	style(this._template.highlight, css);
	style(this._template.piece, css);
}
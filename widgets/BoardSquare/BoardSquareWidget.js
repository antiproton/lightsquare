function BoardSquareWidget(parent, square, size, pieceStyle, pieceDir) {
	this._template=new Template("board_square", parent);
	this._square=square;
	this._size=size;
	this._pieceStyle=pieceStyle;
	this._pieceDir=pieceDir;
	this._piece=SQ_EMPTY;
	this._highlightType=BoardSquareWidget.HIGHLIGHT_NONE;

	this.MouseDown=new Event(this);
	this.MouseUp=new Event(this);

	this._setupHtml();
}

BoardSquareWidget.HIGHLIGHT_NONE="none";
BoardSquareWidget.HIGHLIGHT_POSSIBILITY="possibility";
BoardSquareWidget.HIGHLIGHT_LAST_MOVE_TO="last_move_to";
BoardSquareWidget.HIGHLIGHT_LAST_MOVE_FROM="last_move_from";
BoardSquareWidget.HIGHLIGHT_PREMOVE_TO="premove_to";
BoardSquareWidget.HIGHLIGHT_PREMOVE_FROM="premove_from";
BoardSquareWidget.HIGHLIGHT_CAN_SELECT="can_select";
BoardSquareWidget.HIGHLIGHT_CAN_DROP="can_drop";
BoardSquareWidget.HIGHLIGHT_SELECTED="selected";

BoardSquareWidget.prototype.setHighlight=function(highlightType) {
	var oldClassName="board_square_highlight_"+this._highlightType;
	var newClassName="board_square_highlight_"+highlightType;

	this._template.highlight.classList.remove(oldClassName);
	this._template.highlight.classList.add(newClassName);

	this._highlightType=highlightType;
}

BoardSquareWidget.prototype.getSquare=function() {
	return this._square;
}

BoardSquareWidget.prototype.setSize=function(size) {
	this._size=size;
	this._updateSize();
	this._updatePiece();
}

BoardSquareWidget.prototype.setPiece=function(piece) {
	this._piece=piece;
	this._updatePiece();
}

BoardSquareWidget.prototype.setPieceStyle=function(pieceStyle) {
	this._pieceStyle=pieceStyle;
	this._updatePiece();
}

BoardSquareWidget.prototype.setPieceDir=function(pieceDir) {
	this._pieceDir=pieceDir;
	this._updatePiece();
}

BoardSquareWidget.prototype.setZIndexAbove=function() {
	this._template.root.style.zIndex=2;
}

BoardSquareWidget.prototype.setZIndexNormal=function() {
	this._template.root.style.zIndex=1;
}

BoardSquareWidget.prototype.setSquarePosition=function(x, y) {
	style(this._template.root, {
		top: y,
		left: x
	});
}

BoardSquareWidget.prototype.setPiecePosition=function(x, y) {
	var offsets=getoffsets(this._template.root);

	style(this._template.piece, {
		top: y-offsets[Y],
		left: x-offsets[X]
	});
}

BoardSquareWidget.prototype.resetPiecePosition=function() {
	style(this._template.piece, {
		top: 0,
		left: 0
	});
}

BoardSquareWidget.prototype._setupHtml=function() {
	var self=this;
	var colourName=Colour.getName(Util.getSquareColour(this._square));

	this._template.root.classList.add("board_square_"+colourName);

	this._template.piece.addEventListener("mousedown", function(event) {
		self.MouseDown.fire({
			event: event
		});
	});

	this._template.piece.addEventListener("mouseup", function(event) {
		self.MouseUp.fire({
			event: event
		});
	});

	this._updateSize();
}

BoardSquareWidget.prototype._updatePiece=function() {
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

BoardSquareWidget.prototype._updateSize=function() {
	var css={
		width: this._size,
		height: this._size
	};

	style(this._template.root, css);
	style(this._template.highlight, css);
	style(this._template.piece, css);
}
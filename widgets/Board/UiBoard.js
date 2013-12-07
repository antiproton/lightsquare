function UiBoard(parent) {
	Board.implement(this);

	this.template=new Template("board", parent);

	this.UserMove=new Event(this);
	this.DragDrop=new Event(this);
	this.DragPiece=new Event(this);
	this.MouseOver=new Event(this);
	this.PieceDraggedOff=new Event(this);
	this.SquareClicked=new Event(this);
	this.SelectPiece=new Event(this);
	this.PieceSelected=new Event(this); //fires after SelectPiece if no one cancels it
	this.Deselected=new Event(this);
	this.MouseOverSquare=new Event(this);
	this.MouseLeavingSquare=new Event(this);
	this.PieceOverSquare=new Event(this);
	this.PieceLeavingSquare=new Event(this);

	this._highlightedSquares={};

	this._moveInfo=new UiBoardMoveInfo();
	this._squareMouseCurrentlyOver=null;
	this._squareCurrentlyDraggingPieceOver=null;

	this._boardStyle=UiBoard.STYLE_BROWN;
	this._viewingAs=WHITE;
	this._showSurround=true;
	this._showCoords=true;
	this._coordsPadding=18;
	this._squareSize=45;
	this._pieceStyle=PIECE_STYLE_ALPHA;
	this._pieceDir="/img/pieces";
	this._borderWidth=1;

	this._htmlUpdatesEnabled=true;

	this._setupHtml();
}

UiBoard.STYLE_BROWN="brown";
UiBoard.STYLE_GREEN="green";
UiBoard.STYLE_BLUE="blue";

UiBoard._SQUARE_ZINDEX_ABOVE=5; //currently dragging square
UiBoard._SQUARE_ZINDEX_NORMAL=4; //normal square
UiBoard._SQUARE_ZINDEX_BELOW=2; //square highlight divs

UiBoard.HIGHLIGHT_NONE="none";
UiBoard.HIGHLIGHT_POSSIBILITY="possibility";
UiBoard.HIGHLIGHT_LAST_MOVE_TO="last_move_to";
UiBoard.HIGHLIGHT_LAST_MOVE_FROM="last_move_from";
UiBoard.HIGHLIGHT_PREMOVE_TO="premove_to";
UiBoard.HIGHLIGHT_PREMOVE_FROM="premove_from";
UiBoard.HIGHLIGHT_CAN_SELECT="can_select";
UiBoard.HIGHLIGHT_CAN_DROP="can_drop";
UiBoard.HIGHLIGHT_SELECTED="selected";

UiBoard.prototype.setHtmlUpdatesEnabled=function(enabled) {
	this._htmlUpdatesEnabled=enabled;

	if(enabled) {
		this._updateSquares();
	}
}

UiBoard.prototype.setPieceDir=function(pieceDir) {
	this._pieceDir=pieceDir;
	this._updateHtml();
}

UiBoard.prototype.setPieceStyle=function(pieceStyle) {
	this._pieceStyle=pieceStyle;
	this._updateHtml();
}

UiBoard.prototype.setSquareSize=function(squareSize) {
	this._squareSize=squareSize;
	this._updateHtml();
}

UiBoard.prototype.setShowCoords=function(showCoords) {
	this._showCoords=showCoords;
	this._updateHtml();
}

UiBoard.prototype.setShowSurround=function(showSurround) {
	this._showSurround=showSurround;
	this._updateHtml();
}

UiBoard.prototype.setBorderWidth=function(borderWidth) {
	this._borderWidth=borderWidth;
	this._updateHtml();
}

UiBoard.prototype.setViewingAs=function(colour) {
	this._viewingAs=colour;
	this._updateHtml();
}

UiBoard.prototype.setBoardStyle=function(boardStyle) {
	this._boardStyle=boardStyle;
	this._updateHtml();
}

UiBoard.prototype.setPieceDir=function(pieceDir) {
	this._pieceDir=pieceDir;
	this._updateHtml();
}

UiBoard.prototype._setupHtml=function() {
	var self=this;

	this._setupHtmlCoords();
	this._setupHtmlSquares();

	window.addEventListener("mousemove", function(e) {
		self._boardMouseMove(e);
	});

	this.template.board.addEventListener("mouseout", function(e) {
		self._updateMouseOverInfo(e);
	});

	this._updateHtml();
}

UiBoard.prototype._setupHtmlCoords=function() {
	this._coordContainers={
		rank: this.template.rank_coords,
		file: this.template.file_coords
	};

	this._coords={};

	var coord;

	for(var axis in this._coordContainers) {
		this._coords[axis]=[];

		for(var i=0; i<8; i++) {
			coord=div(this._coordContainers[axis]);
			coord.className="board_coord board_"+axis;

			this._coords[axis].push(coord);
		}
	}
}

UiBoard.prototype._setupHtmlSquares=function() {
	this._uiSquares=[];

	var uiSquare;

	for(var i=0; i<64; i++) {
		uiSquare=new UiBoardSquare(
			this.template.board,
			i,
			this._squareSize,
			this._pieceStyle,
			this._pieceDir
		);

		uiSquare.MouseDown.addHandler(this, function(data) {
			this._boardMouseDown(data.event);
		});

		uiSquare.MouseUp.addHandler(this, function(data) {
			this._boardMouseUp(data.event);
		});

		this._uiSquares.push(uiSquare);
	}
}

UiBoard.prototype._updateHtml=function() {
	var boardSize=this.getBoardSize();
	var borderSize=this._borderWidth*2;
	var paddingIfSurround=(this._showSurround?this._coordsPadding:0);
	var paddingIfCoordsOrSurround=(this._showCoords || this._showSurround?this._coordsPadding:0);
	var totalSize=paddingIfCoordsOrSurround+boardSize+borderSize+paddingIfSurround;

	this.template.root.classList[
		this._showSurround?"add":"remove"
	]("board_with_surround");

	style(this.template.root, {
		width: totalSize,
		height: totalSize
	});

	style(this.template.board, {
		top: paddingIfSurround,
		left: paddingIfCoordsOrSurround,
		width: boardSize,
		height: boardSize,
		borderWidth: this._borderWidth,

	});

	this.template.board.className="board_board board_"+this._boardStyle;

	this._updateHtmlCoords();
	this._updateHtmlSquares();
}

UiBoard.prototype._updateHtmlCoords=function() {
	var fileIndex, rankIndex;
	var boardSize=this.getBoardSize();
	var borderSize=this._borderWidth*2;
	var paddingIfSurround=(this._showSurround?this._coordsPadding:0);

	for(var axis in this._coordContainers) {
		style(this._coordContainers[axis], {
			display: this._showCoords?"":"none"
		});
	}

	if(this._showCoords) {
		style(this._coordContainers.file, {
			top: boardSize+borderSize+paddingIfSurround
		});

		for(var i=0; i<8; i++) {
			style(this._coords.rank[i], {
				top: this._borderWidth+(this._squareSize*i),
				height: this._squareSize,
				lineHeight: this._squareSize
			});

			style(this._coords.file[i], {
				left: this._borderWidth+(this._squareSize*i),
				width: this._squareSize
			});

			if(this._viewingAs===WHITE) {
				rankIndex=7-i;
				fileIndex=i;
			}

			else {
				rankIndex=i;
				fileIndex=7-i;
			}

			this._coords.rank[i].innerHTML=RANK.charAt(rankIndex);
			this._coords.file[i].innerHTML=FILE.charAt(fileIndex);
		}
	}
}

UiBoard.prototype._updateHtmlSquares=function() {
	var uiSquare;

	for(var square=0; square<64; square++) {
		uiSquare=this._uiSquares[square];

		uiSquare.setSize(this._squareSize);
		uiSquare.setPieceStyle(this._pieceStyle);

		var posX, posY;
		var boardX=Util.xFromSquare(square);
		var boardY=Util.yFromSquare(square);

		if(this._viewingAs===WHITE) {
			posX=this._squareSize*boardX;
			posY=this._squareSize*(7-boardY);
		}

		else {
			posX=this._squareSize*(7-boardX);
			posY=this._squareSize*boardY;
		}

		uiSquare.setRootPosition(posX, posY);
	}
}

UiBoard.prototype.setSquare=function(square, piece) {
	Board.prototype.setSquare.call(this, square, piece);

	if(this.htmlUpdatesEnabled) {
		this._setHtmlSquare(square, piece);
	}
}

UiBoard.prototype._setHtmlSquare=function(square, piece) {
	this._uiSquares[square].setPiece(piece);
}

UiBoard.prototype._updateSquares=function() {
	for(var square=0; square<64; square++) {
		this._setHtmlSquare(square, this.board[square]);
	}
}

UiBoard.prototype._squareFromMouseEvent=function(e, use_moveinfo_offsets) {
	var x=e.pageX;
	var y=e.pageY;

	if(use_moveinfo_offsets) { //get the square that the middle of the piece is over
		x+=(Math.round(this._squareSize/2)-this._moveInfo.mouseOffsetX);
		y+=(Math.round(this._squareSize/2)-this._moveInfo.mouseOffsetY);
	}

	var os=getoffsets(this.template.board);

	return this._squareFromOffsets(x-os[X], this.getBoardSize()-(y-os[Y]));
}

UiBoard.prototype._squareFromOffsets=function(x, y) {
	var boardX=(x-(x%this._squareSize))/this._squareSize;
	var boardY=(y-(y%this._squareSize))/this._squareSize;

	if(this._viewingAs==BLACK) {
		boardX=7-boardX;
		boardY=7-boardY;
	}

	return Util.squareFromCoords([boardX, boardY]);
}

UiBoard.prototype._boardMouseDown=function(e) {
	e.preventDefault();

	if(this.mouseIsOnBoard(e)) {
		var square=this._squareFromMouseEvent(e);
		var uiSquare=this._uiSquares[square];
		var offsets=uiSquare.getOffsets();

		if(!this._moveInfo.selected && !this._moveInfo.isInProgress && this.board[square]!==SQ_EMPTY) {
			uiSquare.setZIndex(UiBoard._SQUARE_ZINDEX_ABOVE);
			this._moveInfo.selected=true;
			this._moveInfo.from=square;
			this._moveInfo.piece=this.board[square];
			this._moveInfo.mouseOffsetX=e.pageX-offsets[X];
			this._moveInfo.mouseOffsetY=e.pageY-offsets[Y];
		}
	}
}

UiBoard.prototype._boardMouseMove=function(e) {
	e.preventDefault();

	var square=this._squareFromMouseEvent(e);

	//update mouseover sq and fire events

	this._updateMouseOverInfo(e);
	this._updatePieceDragInfo(e);

	var args;

	if(this._moveInfo.selected && !this._moveInfo.isInProgress) { //down and not already up on same square
		args={
			square: square,
			piece: this.board[square],
			dragging: true,
			cancel: false
		};

		this.SelectPiece.fire(args);

		if(args.cancel) {
			this._moveInfo.reset();
			this._uiSquares[square].setZIndex(UiBoard._SQUARE_ZINDEX_NORMAL);
		}

		else {
			this._moveInfo.mode=UiBoardMoveInfo.DRAG;
			this._moveInfo.isInProgress=true;

			this.PieceSelected.fire({
				square: square
			});
		}
	}

	if(this._moveInfo.selected && this._moveInfo.mode===UiBoardMoveInfo.DRAG) {
		args={
			square: square,
			piece: this._moveInfo.piece,
			cancel: false
		};

		this.DragPiece.fire(args);

		if(!args.cancel) {
			this._uiSquares[this._moveInfo.from].setPiecePosition(
				e.pageX-this._moveInfo.mouseOffsetX,
				e.pageY-this._moveInfo.mouseOffsetY
			);
		}
	}
}

UiBoard.prototype._boardMouseUp=function(e) {
	e.preventDefault();

	var args;
	var square=this._squareFromMouseEvent(e);

	if(this._moveInfo.isInProgress && this._moveInfo.mode===UiBoardMoveInfo.DRAG) {
		square=this._squareFromMouseEvent(e, true);
	}

	var fromUiSquare=null;

	if(this._moveInfo.from!==null) {
		fromUiSquare=this._uiSquares[this._moveInfo.from];
	}

	args={
		square: square,
		cancel: false
	};

	if(this._moveInfo.mode===UiBoardMoveInfo.CLICK) {
		this.SquareClicked.fire(args);
	}

	else if(this._moveInfo.mode===UiBoardMoveInfo.DRAG && this._moveInfo.isInProgress) {
		this.DragDrop.fire(args);
	}

	if(!args.cancel) {
		if(this._moveInfo.isInProgress) {
			//either dragged and dropped, or clicking on second square to complete click-click move

			this.Deselected.fire();

			if(this.mouseIsOnBoard(e, true)) {
				if(square!==this._moveInfo.from) {
					this.UserMove.fire({
						from: this._moveInfo.from,
						to: square,
						piece: this.getSquare(this._moveInfo.from),
						event: e
					});
				}
			}

			else {
				this.PieceDraggedOff.fire({
					from: this._moveInfo.from
				});
			}

			fromUiSquare.resetPiecePosition();
			this._moveInfo.reset();
		}

		else if(this._moveInfo.selected && square===this._moveInfo.from && !this._moveInfo.isInProgress) {
			//clicking on first square to select a piece

			args={
				square: square,
				piece: this.board[square],
				dragging: false,
				cancel: false
			};

			this.SelectPiece.fire(args);

			if(!args.cancel) {
				this._moveInfo.isInProgress=true;
				this._moveInfo.mode=UiBoardMoveInfo.CLICK;

				this.PieceSelected.fire({
					square: square
				});
			}

			else {
				this._moveInfo.reset();
			}
		}
	}

	else {
		if(fromUiSquare!==null) {
			fromUiSquare.resetPiecePosition();
		}

		this._moveInfo.reset();
	}

	if(fromUiSquare!==null) {
		fromUiSquare.setZIndex(UiBoard._SQUARE_ZINDEX_NORMAL);
	}

	this._updatePieceDragInfo(e);
}

UiBoard.prototype.mouseIsOnBoard=function(e, use_offsets, offsets) {
	offsets=offsets||[this._moveInfo.mouseOffsetX, this._moveInfo.mouseOffsetY];

	var x=e.pageX;
	var y=e.pageY;

	if(use_offsets) {
		x+=(Math.round(this._squareSize/2)-offsets[X]);
		y+=(Math.round(this._squareSize/2)-offsets[Y]);
	}

	var os=getoffsets(this.template.board);

	x-=os[X];
	y-=os[Y];

	y=this.getBoardSize()-y;

	return this._isXyOnBoard(x, y);
}

UiBoard.prototype._isXyOnBoard=function(x, y) {
	var boardSize=this.getBoardSize();

	return !(x<0 || x>boardSize || y<0 || y>boardSize);
}

UiBoard.prototype.highlightSquare=function(squares, highlightType) {
	if(!is_array(squares)) {
		squares=[squares];
	}

	this.unhighlightSquares(highlightType);
	this._highlightedSquares[highlightType]=squares;

	for(var i=0; i<squares.length; i++) {
		this._uiSquares[squares[i]].setHighlight(highlightType);
	}
}

UiBoard.prototype.unhighlightSquare=function(square) {
	if(square!==null) {
		this._uiSquares[square].setHighlight("none");
	}
}

UiBoard.prototype.getBoardSize=function() {
	return this._squareSize*8;
}

UiBoard.prototype._updateMouseOverInfo=function(e) {
	var square=this._squareFromMouseEvent(e);

	if(this.mouseIsOnBoard(e) && square>-1 && square<64) { //mouseIsOnBoard doesn't appear to be enough
		if(this._squareMouseCurrentlyOver!=square) {
			if(this._squareMouseCurrentlyOver!==null) {
				this.MouseLeavingSquare.fire({
					square: this._squareMouseCurrentlyOver
				});
			}

			this._squareMouseCurrentlyOver=square;

			this.MouseOverSquare.fire({
				square: square
			});
		}
	}

	else {
		if(this._squareMouseCurrentlyOver!==null) {
			this.MouseLeavingSquare.fire({
				square: this._squareMouseCurrentlyOver
			});
		}

		this._squareMouseCurrentlyOver=null;
	}
}

UiBoard.prototype._updatePieceDragInfo=function(e) {
	var square=this._squareFromMouseEvent(e, true);

	if(this._moveInfo.isInProgress && this._moveInfo.mode===UiBoardMoveInfo.DRAG) {
		if(this.mouseIsOnBoard(e)) {
			if(this._squareCurrentlyDraggingPieceOver!=square) {
				if(this._squareCurrentlyDraggingPieceOver!==null) {
					this.PieceLeavingSquare.fire({
						square: this._squareCurrentlyDraggingPieceOver
					});
				}

				this._squareCurrentlyDraggingPieceOver=square;

				this.PieceOverSquare.fire({
					square: square
				});
			}
		}

		else {
			if(this._squareCurrentlyDraggingPieceOver!==null) {
				this.PieceLeavingSquare.fire({
					square: this._squareCurrentlyDraggingPieceOver
				});
			}

			this._squareCurrentlyDraggingPieceOver=null;
		}
	}

	else {
		if(this._squareCurrentlyDraggingPieceOver!==null) {
			this.PieceLeavingSquare.fire({
				square: this._squareCurrentlyDraggingPieceOver
			});
		}

		this._squareCurrentlyDraggingPieceOver=null;
	}
}

UiBoard.prototype.setFen=function(fen) {
	Board.prototype.setFen.call(this, fen);

	this._updateSquares();
}
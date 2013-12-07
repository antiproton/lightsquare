function UiBoard(parent) {
	Board.implement(this);
	Control.implement(this, parent);

	this._fileCoords=[];
	this._rankCoords=[];
	this._uiSquares=[]; //array of anonymous objects (see def in _setupHtml)


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

	//NOTE premove highlighting is done the manual way (board.highlightSquare(sq, board.HlPremoveFrom))

	this.highlitedPossibilities=[];
	this.highlitedPremovesFrom=[];
	this.highlitedPremovesTo=[];
	this.highlitedLastMoveFrom=null;
	this.highlitedLastMoveTo=null;
	this.highlitedCanSelect=null;
	this.highlitedCanDrop=null;
	this.highlitedSelected=null;

	this._moveInfo=new MoveInfo();
	this._squareMouseCurrentlyOver=null;
	this._squareCurrentlyDraggingPieceOver=null;

	this._viewingAs=WHITE;
	this._showSurround=true;
	this._showCoords=true;
	this._squareSize=45;
	this._pieceStyle=PIECE_STYLE_ALPHA;
	this._squareColour=[];
	this._squareColour[WHITE]="f0d9b5";
	this._squareColour[BLACK]="b58863";
	this._squareHighlightBorder=0; //gap around the edge of the highlight div to fit a border in

	this._htmlUpdatesEnabled=true; //visual updates can be temporarily turned off entirely to ensure consistency when multiple events are causing updates

	this._initSetters();

	this._setupHtml();
}

UiBoard.SQUARE_ZINDEX_ABOVE=5; //currently dragging square
UiBoard.SQUARE_ZINDEX_NORMAL=4; //normal square
UiBoard.SQUARE_ZINDEX_BELOW=2; //square highlight divs

UiBoard.HIGHLIGHT_NONE="none";
UiBoard.HIGHLIGHT_POSSIBILITY="possibility";
UiBoard.HIGHLIGHT_LAST_MOVE_TO="last_move_to";
UiBoard.HIGHLIGHT_LAST_MOVE_FROM="last_move_from";
UiBoard.HIGHLIGHT_PREMOVE_TO="premove_to";
UiBoard.HIGHLIGHT_PREMOVE_FROM="premove_from";
UiBoard.HIGHLIGHT_CAN_SELECT="can_select";
UiBoard.HIGHLIGHT_CAN_DROP="can_drop";
UiBoard.HIGHLIGHT_SELECTED="selected";

UiBoard.prototype._initSetters=function() {
	this.htmlUpdatesEnabled=new Property(this, function() {
		return this._htmlUpdatesEnabled;
	}, function(value) {
		this._htmlUpdatesEnabled=value;

		if(this._htmlUpdatesEnabled) {
			this._updateSquares();
		}
	});

	this.squareColour=new Property(this, function(colour) {
		return this._squareColour[colour];
	}, function(colour, value) {
		if(this._squareColour[colour]!==value) {
			this._squareColour[colour]=value;
			this._updateHtml();
		}
	});

	this.viewingAs=new Property(this, function() {
		return this._viewingAs;
	}, function(value) {
		if(this._viewingAs!==value) {
			this._viewingAs=value;
			this._updateHtml();
		}
	});

	this.showSurround=new Property(this, function() {
		return this._showSurround;
	}, function(value) {
		if(this._showSurround!==value) {
			this._showSurround=value;
			this._updateHtml();
		}
	});

	this.showCoords=new Property(this, function() {
		return this._showCoords;
	}, function(value) {
		if(this._showCoords!==value) {
			this._showCoords=value;

			if(this._showCoords) {
				this.showCoordsPadding(true);
			}

			this._updateHtml();
		}
	});

	this.squareSize=new Property(this, function() {
		return this._squareSize;
	}, function(value) {
		if(this._squareSize!==value) {
			this._squareSize=parseInt(value);
			this.PromoteDialog.SquareSize(value);
			this._updateHtml();
		}
	});

	this.pieceStyle=new Property(this, function() {
		return this._pieceStyle;
	}, function(value) {
		if(this._pieceStyle!==value) {
			this._pieceStyle=value;
			this.PromoteDialog.PieceStyle(value);
			this._updateHtml();
		}
	});
}

UiBoard.prototype._setupHtml=function() {
	var self=this;

	this._fileCoords=[];
	this._rankCoords=[];
	this._uiSquares=[];

	this.tpl=new Template("board", this.node);

	this.board_div.addEventListener("mouseout", function(e) {
		self._updateMouseOverInfo(e);
	});

	var coord, coord_outer, coord_inner;

	/*
	rank coords
	*/

	for(var i=0; i<8; i++) {
		coord_outer=div(this._innerContainer);
		coord_inner=div(coord_outer);

		coord={
			container: coord_outer,
			node: coord_inner
		};

		this._rankCoords.push(coord);
	}

	/*
	file coords
	*/

	for(var i=0; i<8; i++) {
		coord_outer=div(this._innerContainer);
		coord_inner=div(coord_outer);

		coord={
			container: coord_outer,
			node: coord_inner
		};

		this._fileCoords.push(coord);
	}

	/*
	squares
	*/

	var uiSquare;

	for(var i=0; i<64; i++) {
		uiSquare=new UiBoardSquare(this._boardContainer);

		uiSquare.MouseDown.addHandler(this, function(data) {
			this._boardMouseDown(data.event);
		});

		uiSquare.MouseUp.addHandler(this, function(data) {
			this._boardMouseUp(data.event);
		});

		this._uiSquares.push(square);
	}

	/*
	mousemove - no point adding to individual squares like mouseup/mousedown
	*/

	window.addEventListener("mousemove", function(e) {
		self._boardMouseMove(e);
	});

	this._updateHtml();
}

/*
set the size, position and other style attributes on the elements
*/

UiBoard.prototype._updateHtml=function() { //after switching colours ,changing size tec
	var rank_index, file_index, text;
	var boardSize=this.getBoardSize();

	var coordsDisplay=this._showSurround?"":"none";
	var coordsVisibility=this._showCoords?"":"hidden";

	style(this._boardContainer, {
		width: boardSize,
		height: boardSize
	});

	/*
	coords
	*/

	this._updateHtmlCoords();


	/*
	board
	*/

	style(this.node, {
		width: container_padding_r+(this._borderWidth*2)+boardSize,
		height: container_padding_f+(this._borderWidth*2)+boardSize
	});

	style(this._borderContainer, {
		top: 0,
		left: container_padding_r
	});

	style(this._boardContainer, {
		top: this._borderWidth,
		left: container_padding_r+this._borderWidth, //r is "rank" not "right"
		width: boardSize,
		height: boardSize
	});

	style(this.board_div, {
		position: "absolute",
		width: boardSize,
		height: boardSize,
		backgroundImage: bgimg
	});

	/*
	squares
	*/



	/*
	pieces
	*/

	this._updateSquares();

	/*
	dialogs
	*/

	var c=this._squareSize*4; //center of the board

	this.PromoteDialog.SetLocation([c, c], true);
	this.GameOverDialog.SetLocation(c, c);
	this.ForceResignDialog.SetLocation(c, c);
}

UiBoard.prototype._updateHtmlCoords=function() {
	for(var i=0; i<8; i++) {
		style(this._rankCoords[i].container, {
			top: this._borderWidth+(this._squareSize*i),
			height: this._squareSize,
			display: coordsDisplay,
			visibility: coordsVisibility
		});

		style(this._fileCoords[i].container, {
			left: this._borderWidth+(this._squareSize*i),
			width: this._squareSize,
			display: coordsDisplay,
			visibility: coordsVisibility
		});


		if(this._viewingAs===WHITE) {
			rank_index=7-i;
			file_index=i;
		}

		else {
			rank_index=i;
			file_index=7-i;
		}

		this._rankCoords[i].node.innerHTML=RANK.charAt(rank_index);
		this._fileCoords[i].node.innerHTML=FILE.charAt(file_index);

	}
}

UiBoard.prototype._updateHtmlSquares=function() {
	var uiSquare;

	for(var square=0; square<64; square++) {
		uiSquare=this._uiSquares[square];

		uiSquare.setSize(this._squareSize);
		uiSquare.setColour(this._squareColour[Util.getSquareColour(square)]);

		/*
		FIXME
		need to clarify distinction between moving a square's node and moving
		its container
		*/

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
	for(var square=0; sq<this.board.length; sq++) {
		this._setHtmlSquare(sq, this.board[sq]);
	}
}

UiBoard.prototype.squareFromMouseEvent=function(e, use_offsets, offsets) { //useoffsets to calc for middle of piece
	offsets=offsets||[this._moveInfo.offsetX, this._moveInfo.offsetY];

	var x=e.pageX;
	var y=e.pageY;

	if(use_offsets) {
		x+=(Math.round(this._squareSize/2)-offsets[X]);
		y+=(Math.round(this._squareSize/2)-offsets[Y]);
	}

	var os=getoffsets(this.board_div);

	return this._squareFromOffsets(x-os[X], this.getBoardSize()-(y-os[Y]));
}
//FIXME probably clearer to merge this method into above (only place used)
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
		var sq=this.squareFromMouseEvent(e);
		var uiSquare=this._uiSquares[sq];
		var os=getoffsets(uiSquare.container);

		if(!this._moveInfo.selected && !this._moveInfo.isInProgress && this.board[sq]!==SQ_EMPTY) { //first click or start of drag
			this._setZIndexAboveRest(uiSquare);
			this._moveInfo.selected=true;
			this._moveInfo.from=sq;
			this._moveInfo.piece=this.board[sq];
			this._moveInfo.offsetX=e.pageX-os[X];
			this._moveInfo.offsetY=e.pageY-os[Y];
		}
	}
}

UiBoard.prototype._boardMouseMove=function(e) {
	e.preventDefault();

	var square=this.squareFromMouseEvent(e);

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
			this._resetZIndex(this._uiSquares[square]);
		}

		else {
			this._moveInfo.mode=MoveInfo.DRAG;
			this._moveInfo.isInProgress=true;

			this.PieceSelected.fire({
				square: square
			});
		}
	}

	if(this._moveInfo.selected && this._moveInfo.mode===MoveInfo.DRAG) {
		args={
			square: square,
			piece: this._moveInfo.piece,
			cancel: false
		};

		this.DragPiece.fire(args);

		if(!args.cancel) {
			this._setSquareXyPos(
				this._uiSquares[this._moveInfo.from],
				e.pageX-this._moveInfo.offsetX,
				e.pageY-this._moveInfo.offsetY
			);
		}
	}
}

UiBoard.prototype._boardMouseUp=function(e) {
	e.preventDefault();

	var args;
	var square=this.squareFromMouseEvent(e);

	if(this._moveInfo.isInProgress && this._moveInfo.mode===MoveInfo.DRAG) {
		square=this.squareFromMouseEvent(
			e,
			true,
			[this._moveInfo.offsetX, this._moveInfo.offsetY]
		);
	}

	var fromUiSquare=null;

	if(this._moveInfo.from!==null) {
		fromUiSquare=this._uiSquares[this._moveInfo.from];
	}

	args={
		square: square,
		moveInfo: this._moveInfo,
		cancel: false,
		event: e
	};

	if(this._moveInfo.mode===MoveInfo.CLICK) {
		this.SquareClicked.fire(args);
	}

	else if(this._moveInfo.mode===MoveInfo.DRAG && this._moveInfo.isInProgress) {
		this.DragDrop.fire(args);
	}

	if(!args.cancel) {
		if(this._moveInfo.isInProgress) {
			//either dragged and dropped, or clicking on second square to complete click-click move

			this.Deselected.fire();

			if(this.mouseIsOnBoard(e, true)) {
				if(square!=this._moveInfo.from) {
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

			this._resetSquarePos(fromUiSquare);
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

			if(args.cancel) {
				this._moveInfo.reset();
			}

			else {
				this._moveInfo.isInProgress=true;
				this._moveInfo.mode=MoveInfo.CLICK;

				this.PieceSelected.fire({
					square: square
				});
			}
		}
	}

	else {
		if(fromUiSquare!==null) {
			this._resetSquarePos(fromUiSquare);
		}

		this._moveInfo.reset();
	}

	if(fromUiSquare!==null) {
		this._resetZIndex(fromUiSquare);
	}

	this._updatePieceDragInfo(e);
}

UiBoard.prototype._setZIndexAboveRest=function(uiSquare) {
	uiSquare.setZIndex(UiBoard.SQUARE_ZINDEX_ABOVE);
}

UiBoard.prototype._resetZIndex=function(uiSquare) {
	uiSquare.setZIndex(UiBoard.SQUARE_ZINDEX_NORMAL);
}

UiBoard.prototype._resetSquarePos=function(uiSquare) { //return the inner bit to its container pos
	uiSquare.resetPosition();
}

UiBoard.prototype._setSquareXyPos=function(uiSquare, x, y) { //takes mouse coords
	uiSquare.setPosition(x, y);
}

UiBoard.prototype.mouseIsOnBoard=function(e, use_offsets, offsets) {
	offsets=offsets||[this._moveInfo.offsetX, this._moveInfo.offsetY];

	var x=e.pageX;
	var y=e.pageY;

	if(use_offsets) {
		x+=(Math.round(this._squareSize/2)-offsets[X]);
		y+=(Math.round(this._squareSize/2)-offsets[Y]);
	}

	var os=getoffsets(this.board_div);

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
	this.unhighlightSquares(highlightType);

	if(!is_array(squares)) {
		squares=[squares];
	}

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
	var square=this.squareFromMouseEvent(e);

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
	var square=this.squareFromMouseEvent(e, true);

	if(this._moveInfo.isInProgress && this._moveInfo.mode==MoveInfo.DRAG) {
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
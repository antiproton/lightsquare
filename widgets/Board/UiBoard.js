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

	this._viewAs=WHITE;
	this._showCoordsPadding=true;
	this._showCoords=true;

	this._squareSize=45;
	this._pieceStyle=PIECE_STYLE_ALPHA;
	this._squareColour=[];
	this._squareColour[WHITE]="f0d9b5";
	this._squareColour[BLACK]="b58863";
	this._squareHighlightBorder=0; //gap around the edge of the highlight div to fit a border in

	this._htmlUpdatesEnabled=true; //visual updates can be temporarily turned off entirely to ensure consistency when multiple events are causing updates

	this.init_props();

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

UiBoard.prototype.init_props=function() {
	this.htmlUpdatesEnabled=setter(this, function() {
		return this._htmlUpdatesEnabled;
	}, function(value) {
		this._htmlUpdatesEnabled=value;

		if(value===true) {
			this._updateSquares();
		}
	});

	this.squareColour=setter(this, function() {
		return this._squareColour;
	}, function(value) {
		if(this._squareColour!==value) {
			this._squareColour=value;
			this._updateHtml();
		}
	});

	this.viewAs=setter(this, function() {
		return this._viewAs;
	}, function(value) {
		if(this._viewAs!==value) {
			this._viewAs=value;
			this._updateHtml();
		}
	});

	this.showCoordsPadding=setter(this, function() {
		return this._showCoordsPadding;
	}, function(value) {
		if(this._showCoordsPadding!==value) {
			this._showCoordsPadding=value;
			this._updateHtml();
		}
	});

	this.showCoords=setter(this, function() {
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

	this.squareSize=setter(this, function() {
		return this._squareSize;
	}, function(value) {
		if(this._squareSize!==value) {
			this._squareSize=parseInt(value);
			this.PromoteDialog.SquareSize(value);
			this._updateHtml();
		}
	});

	this.pieceStyle=setter(this, function() {
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

	/*
	inner container so that the absolute-positioned things
	can be inside an absolute element, but the outer container (Node)
	can still be non-absolute so that it fills up its container
	*/

	this._innerContainer=div(this.node);

	style(this._innerContainer, {
		position: "absolute"
	});

	/*
	board
	*/

	this._borderContainer=div(this._innerContainer);

	style(this._borderContainer, {
		position: "absolute",
		zIndex: 0
	});

	this._boardContainer=div(this._innerContainer);

	style(this._boardContainer, {
		position: "absolute",
		zIndex: 1
	});

	this.board_div=div(this._boardContainer);

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

	var square, sq_outer, sq_inner, highlight;

	for(var r=0; r<8; r++) {
		for(var f=0; f<8; f++) {
			sq_outer=div(this.board_div);
			highlight=div(sq_outer);
			sq_inner=div(sq_outer);

			style(sq_outer, {
				position: "absolute"
			});

			style(sq_inner, {
				position: "absolute",
				zIndex: UiBoard.SQUARE_ZINDEX_NORMAL
			});

			style(highlight, {
				position: "absolute",
				zIndex: UiBoard.SQUARE_ZINDEX_BELOW,
				borderStyle: "solid",
				borderColor: "transparent",
				visibility: "hidden"
			});

			sq_inner.addEventListener("mousedown", function(e) {
				self._boardMouseDown(e);
			});

			sq_inner.addEventListener("mouseup", function(e) {
				self._boardMouseUp(e);
			});

			square={
				container: sq_outer,
				node: sq_inner,
				highlight: highlight
			};

			this._uiSquares.push(square);
		}
	}

	/*
	mousemove - no point adding to individual squares like mouseup/mousedown
	*/

	window.addEventListener("mousemove", function(e) {
		self._boardMouseMove(e);
	});

	/*
	promote dialog - the board gets a promote dialog ready as there will usually be aboard there
	if the pd is needed, and it will usually have to be in the center of the board
	*/

	this.PromoteDialog=new PromoteDialog(this.board_div);
	this.PromoteDialog.Zindex(UiBoard.SQUARE_ZINDEX_ABOVE);
	this.PromoteDialog.ImgDirPiece(this.img_dir_piece);
	this.PromoteDialog.PieceStyle(this._pieceStyle);
	this.PromoteDialog.SquareSize(this._squareSize);

	/*
	game over dialog - this is part of the board to simplifiy positioning it
	and getting the zIndex right.
	*/

	this.GameOverDialog=new GameOverDialog(this.board_div);
	this.GameOverDialog.Zindex(UiBoard.SQUARE_ZINDEX_ABOVE);

	/*
	force resign dialog
	*/

	this.ForceResignDialog=new ForceResignDialog(this.board_div);
	this.ForceResignDialog.Zindex(UiBoard.SQUARE_ZINDEX_ABOVE);

	this._updateHtml();
}

/*
set the size, position and other style attributes on the elements
*/

UiBoard.prototype._updateHtml=function() { //after switching colours ,changing size tec
	var rank_index, file_index, text;
	var boardSize=this.getBoardSize();
	var coord_size_r=this.CoordSizeR();
	var coord_size_f=this.CoordSizeF();
	var rankCoordsDisplaySize=this._showCoordsPadding?coord_size_r:0;
	var fileCoordsDisplaySize=this._showCoordsPadding?coord_size_f:0;
	var container_padding_r=this.container_border?coord_size_r:rankCoordsDisplaySize;
	var container_padding_f=this.container_border?coord_size_f:fileCoordsDisplaySize;
	
	var coords_display=this._showCoordsPadding?"":"none";
	var coords_visibility=this._showCoords?"":"hidden";

	/*
	container border (bit around the edge with the shadow)
	*/

	style(this.node, {
		paddingTop: this.container_border?coord_size_f:0,
		paddingRight: this.container_border?coord_size_r:0,
		borderWidth: this.container_border?this.container_border_border_width:0,
		borderColor: this.container_border_border_colour,
		borderStyle: "solid",
		//borderRadius: 3,
		//boxShadow: (this.container_border && this.container_shadow)?"1px 1px 1px rgba(50, 50, 50, 0.3)":"none",
		backgroundColor: this.container_border?this.container_background:"inherit"
	});


	style(this._boardContainer, {
		width: boardSize,
		height: boardSize
	});

	/*
	coords
	*/

	for(var i=0; i<8; i++) {
		style(this._rankCoords[i].container, {
			position: "absolute",
			top: this._borderWidth+(this._squareSize*i),
			left: 0,
			height: this._squareSize,
			width: rankCoordsDisplaySize,
			display: coords_display,
			visibility: coords_visibility,
			cursor: "default"
		});

		style(this._fileCoords[i].container, {
			position: "absolute",
			top: (this._borderWidth*2)+boardSize,
			left: coord_size_r+this._borderWidth+(this._squareSize*i),
			width: this._squareSize,
			height: fileCoordsDisplaySize,
			display: coords_display,
			visibility: coords_visibility,
			cursor: "default"
		});


		if(this._viewAs===WHITE) {
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

	var bgimg="none";

	if(this.board_style!==null) {
		bgimg=Base.App.CssImg(this.img_dir_board+"/"+this.board_style+"/"+this._squareSize+".png");
	}

	style(this.board_div, {
		position: "absolute",
		width: boardSize,
		height: boardSize,
		backgroundImage: bgimg
	});

	/*
	squares
	*/

	var square;

	for(var sq=0; sq<this._uiSquares.length; sq++) {
		square=this._uiSquares[sq];

		style(square.container, {
			width: this._squareSize,
			height: this._squareSize,
			backgroundColor: "#"+this._squareColour[Util.getSquareColour(sq)]
		});

		this._setSquarePos(square, sq);

		style(square.node, {
			width: this._squareSize,
			height: this._squareSize
		});

		style(square.highlight, {
			width: this._squareSize-(this._squareHighlightBorder*2),
			height: this._squareSize-(this._squareHighlightBorder*2),
			borderWidth: this._squareHighlightBorder
		});
	}

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

UiBoard.prototype.setSquare=function(square, piece) {
	Board.prototype.setSquare.call(this, square, piece);

	if(this.htmlUpdatesEnabled) {
		this._setHtmlSquare(square, piece);
	}
}

UiBoard.prototype._setHtmlSquare=function(sq, pc) {
	var bgimg="none";

	if(pc!==SQ_EMPTY) {
		bgimg="url("+this.img_dir_piece+"/"+this._pieceStyle+"/"+this._squareSize+"/"+Fen.getPieceChar(pc)+".png)";
	}

	if(this._uiSquares[sq].node.style.backgroundImage!==bgimg) { //performance is noticeably better with this check
		this._uiSquares[sq].node.style.backgroundImage=bgimg;
	}
}

UiBoard.prototype._updateSquares=function() {
	for(var sq=0; sq<this.board.length; sq++) {
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

UiBoard.prototype._squareFromOffsets=function(x, y) {
	var f=(x-(x%this._squareSize))/this._squareSize;
	var r=(y-(y%this._squareSize))/this._squareSize;

	if(this._viewAs==BLACK) {
		f=7-f;
		r=7-r;
	}

	return Util.squareFromCoords([f, r]);
}

UiBoard.prototype._setSquarePos=function(square, sq) {
	var x, y;
	var r=Util.yFromSquare(sq);
	var f=Util.xFromSquare(sq);

	if(this._viewAs==BLACK) {
		x=this._squareSize*(7-f);
		y=this._squareSize*r;
	}

	else {
		x=this._squareSize*f;
		y=this._squareSize*(7-r);
	}

	/*
	absolute is relative to first absolute ancestor, so now that the board
	is absolute the squares don't have to add anything to these offsets
	*/

	style(square.container, {
		top: y,
		left: x
	});
}

UiBoard.prototype._resetSquarePos=function(uiSquare) { //return the inner bit to its container pos
	style(uiSquare.node, {
		top: 0,
		left: 0
	});
}

UiBoard.prototype._setSquareXyPos=function(square, x, y) { //takes mouse coords
	var os=getoffsets(square.container);

	style(square.node, {
		top: y-os[Y],
		left: x-os[X]
	});
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

UiBoard.prototype._setZIndexAboveRest=function(square) {
	style(square.node, {
		zIndex: UiBoard.SQUARE_ZINDEX_ABOVE
	});
}

UiBoard.prototype._resetZIndex=function(square) {
	style(square.node, {
		zIndex: UiBoard.SQUARE_ZINDEX_NORMAL
	});
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

UiBoard.prototype.highlightSquare=function(squares, className) {
	this.unhighlightSquares(className);

	if(!is_array(squares)) {
		squares=[squares];
	}

	this._highlightedSquares[className]=squares;

	for(var i=0; i<squares.length; i++) {
		this._uiSquares[squares[i]].highlight.className="highlight "+className;
	}
}

UiBoard.prototype.unhighlightSquare=function(square) {
	if(square!==null) {
		this._uiSquares[square].highlight.className="highlight none";
	}
}

UiBoard.prototype.highlightPossibilities=function(squares) {
	this.unhighlightPossibilities();

	this.highlitedPossibilities=squares;

	for(var i=0; i<this.highlitedPossibilities.length; i++) {
		this.highlightSquare(this.highlitedPossibilities[i], "possibility");
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

UiBoard.prototype.deselect=function() {
	if(this._moveInfo.isInProgress) {
		this._resetZIndex(this._uiSquares[this._moveInfo.from]);
		this._moveInfo.reset();
	}
}

UiBoard.prototype.setFen=function(fen) {
	Board.prototype.setFen.call(this, fen);

	this._updateSquares();
}
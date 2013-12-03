/*
NOTE for updating this in the future - MoveInfo is a complete wreck.
definition is in moveInfo.reset.  used in all kinds of places, don't
bother trying to edit.

TODO refactor MoveInfo
*/

function UiBoard(parent) {
	Board.implement(this);
	Control.implement(this, parent, true);

	this._fileCoords=[];
	this._rankCoords=[];
	this._uiSquares=[]; //array of anonymous objects (see def in _setupHtml)

	//square the mouse is over
	this._squareMouseCurrentlyOver=null;

	//square the currently dragging piece will drop on if dropped (see Sq..Over/Out events)
	this._squareCurrentlyDraggingPieceOver=null;

	this.UserMove=new Event(this);
	this.DragDrop=new Event(this);
	this.DragMove=new Event(this);
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

	this.init_hilite_styles();

	//NOTE premove highlighting is done the manual way (board.hiliteSq(sq, board.HlPremoveFrom))

	this.HilitPossibilities=[];
	this.HilitLastMoveFrom=null;
	this.HilitLastMoveTo=null;
	this.HilitCanSelect=null;
	this.HilitCanDrop=null;
	this.HilitSelected=null;

	/*
	move action processing
	*/

	this.moveMode=MoveInfo.CLICK|MoveInfo.DRAG_DROP;
	this.moveInfo=new MoveInfo();

	/*
	putting the rank coords dead center made them look slightly too low.
	this value moves them up (positive values) or down (negative values)
	by the specified number of pixels.
	*/

	this.coord_r_hinting=1;

	//Properties

	/*
	NOTE css colours are mostly stored with the hash here, but square colours
	aren't because of how prefs are stored.  probably none should be stored with
	hash anywhere
	*/

	this.border=["#5f5f5f", "#5f5f5f"]; //colour of each pixel of border, from outside to inside
	this.show_coords_padding=true; //whether to have gaps around bottom and left to fit coordinates
	this.show_coords=true; //whether to show the coordinates
	this.coord_size_r=18; //how big a gap to have for coordinates on the left
	this.coord_size_f=18; //how big a gap to have for coordinates on the bottom
	this.coords_font_family="sans-serif";
	this.coords_font_size=11;
	this.coords_font_color="#303030";
	this._squareSize=45;
	this.view_as=WHITE;
	this.img_dir_board="/img/board";
	this.img_dir_piece="/img/piece";
	this.board_style=null;
	this.piece_style=PIECE_STYLE_ALPHA;
	this.square_colour=[];
	this.square_colour[WHITE]="f0d9b5";
	this.square_colour[BLACK]="b58863";
	this.square_highlight_border=0; //gap around the edge of the highlight div to fit a border in
	this.htmlUpdatesEnabled=true; //visual updates can be temporarily turned off entirely to ensure consistency when multiple events are causing updates
	this.container_border=true;
	this.container_background="#efefef";
	this.container_shadow=true;
	this.container_border_border_width=1;
	this.container_border_border_colour="#dfdfdf";

	this.init_props();

	this._setupHtml();
}

/*
NOTE PieceStore uses these as well
*/

UiBoard.SQ_ZINDEX_ABOVE=5; //currently dragging square
UiBoard.SQ_ZINDEX_NORMAL=4; //normal square
UiBoard.SQ_ZINDEX_BELOW=2; //square highlight nodes

/*
initialise default square highlighting styles
*/

UiBoard.prototype.init_hilite_styles=function() {
	/*
	NOTE these styles all need to specify the same set of properties,
	otherwise styles from other highlight types will be left over.
	*/

	this.HlNone={
		visibility: "hidden"
	};

	this.HlPossibility={
		visibility: "inherit",
		backgroundColor: "#99e457",
		backgroundImage: "none",
		opacity: ".9"
	};

	this.HlLastMoveFrom={
		visibility: "inherit",
		backgroundColor: "#62c1fe",
		//backgroundColor: "#62afe0",
		//backgroundImage: "-webkit-radial-gradient(center, ellipse cover, rgba(110, 182, 226, 1) 0%, rgba(110, 182, 226, 0) 70%)",
		opacity: ".5"
	};

	this.HlLastMoveTo={
		visibility: "inherit",
		backgroundColor: "#62c1fe",
		//backgroundColor: "#62afe0",
		//backgroundImage: "-webkit-radial-gradient(center, ellipse cover, rgba(110, 182, 226, 1) 0%, rgba(110, 182, 226, 0) 70%)",
		opacity: ".8"
	};

	this.HlPremoveFrom={
		visibility: "inherit",
		backgroundColor: "#199a65",
		backgroundImage: "none",
		opacity: ".9"
	};

	this.HlPremoveTo={
		visibility: "inherit",
		backgroundColor: "#199a65",
		backgroundImage: "none",
		opacity: ".9"
	};

	this.HlCanSelect={
		visibility: "inherit",
		backgroundColor: "#fbfddd",
		backgroundImage: "none",
		opacity: ".9"
	};

	this.HlCanDrop={
		visibility: "inherit",
		backgroundColor: "#fbfddd",
		backgroundImage: "none",
		opacity: ".9"
	};

	this.HlSelected={
		visibility: "inherit",
		backgroundColor: "#C9F06B",
		//backgroundImage: "",
		//boxShadow: "inset 0 0 3px 2px rgba(255, 255, 229, 0.8)",
		opacity: ".8"
	};
}

UiBoard.prototype.init_props=function() {
	this.Html_updatesEnabled=setter(this, function() {
		return this.htmlUpdatesEnabled;
	}, function(value) {
		this.htmlUpdatesEnabled=value;

		if(value===true) {
			this._updateSquares();
		}
	});

	this.SquareColour=setter(this, function() {
		return this.square_colour;
	}, function(value) {
		if(this.square_colour!==value) {
			this.square_colour=value;
			this._updateHtml();
		}
	});

	this._fileCoordsontSize=setter(this, function() {
		return this.coords_font_size;
	}, function(value) {
		if(this.coords_font_size!==value) {
			this.coords_font_size=value;
			this._updateHtml();
		}
	});

	this._fileCoordsontFamily=setter(this, function() {
		return this.coords_font_family;
	}, function(value) {
		if(this.coords_font_family!==value) {
			this.coords_font_family=value;
			this._updateHtml();
		}
	});

	this._fileCoordsontColor=setter(this, function() {
		return this.coords_font_color;
	}, function(value) {
		if(this.coords_font_color!==value) {
			this.coords_font_color=value;
			this._updateHtml();
		}
	});

	this.ImgDirBoard=setter(this, function() {
		return this.img_dir_board;
	}, function(value) {
		if(this.img_dir_board!==value) {
			this.img_dir_board=value;
			this._updateHtml();
		}
	});

	this.ImgDirPiece=setter(this, function() {
		return this.img_dir_piece;
	}, function(value) {
		if(this.img_dir_piece!==value) {
			this.img_dir_piece=value;
			this.PromoteDialog.ImgDirPiece(value);
			this._updateHtml();
		}
	});

	this.ViewAs=setter(this, function() {
		return this.view_as;
	}, function(value) {
		if(this.view_as!==value) {
			this.view_as=value;
			this._updateHtml();
		}
	});

	this.CoordSizeF=setter(this, function() {
		return this.coord_size_f;
	}, function(value) {
		if(this.coord_size_f!==value) {
			this.coord_size_f=value;
			this._updateHtml();
		}
	});

	this.CoordSizeR=setter(this, function() {
		return this.coord_size_r;
	}, function(value) {
		if(this.coord_size_r!==value) {
			this.coord_size_r=value;
			this._updateHtml();
		}
	});

	this.ShowCoordsPadding=setter(this, function() {
		return this.show_coords_padding;
	}, function(value) {
		if(this.show_coords_padding!==value) {
			this.show_coords_padding=value;
			this._updateHtml();
		}
	});

	this.ShowCoords=setter(this, function() {
		return this.show_coords;
	}, function(value) {
		if(this.show_coords!==value) {
			this.show_coords=value;

			if(this.show_coords) {
				this.ShowCoordsPadding(true);
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

	this.BoardStyle=setter(this, function() {
		return this.board_style;
	}, function(value) {
		if(this.board_style!==value) {
			this.board_style=value;
			this._updateHtml();
		}
	});

	this.PieceStyle=setter(this, function() {
		return this.piece_style;
	}, function(value) {
		if(this.piece_style!==value) {
			this.piece_style=value;
			this.PromoteDialog.PieceStyle(value);
			this._updateHtml();
		}
	});

	this.Border=setter(this, function() {
		return this.border;
	}, function(value) {
		this.board_style=value;
		this._updateHtml();
		this.UiUpdate.fire();
	});

	this.SquareHighlightBorder=setter(this, function() {
		return this.square_highlight_border;
	}, function(value) {
		if(this.board_style!==value) {
			this.board_style=value;
			this._updateHtml();
		}
	});

	this.ContainerBorder=setter(this, function() {
		return this.container_border;
	}, function(value) {
		if(this.container_border!==value) {
			this.container_border=value;
			this._updateHtml();
		}
	});

	this.ContainerBackground=setter(this, function() {
		return this.container_background;
	}, function(value) {
		if(this.container_background!==value) {
			this.container_background=value;
			this._updateHtml();
		}
	});

	this.ContainerShadow=setter(this, function() {
		return this.container_shadow;
	}, function(value) {
		if(this.container_shadow!==value) {
			this.container_shadow=value;
			this._updateHtml();
		}
	});

	this.ContainerBorderBorderWidth=setter(this, function() {
		return this.container_border_border_width;
	}, function(value) {
		if(this.container_border_border_width!==value) {
			this.container_border_border_width=value;
			this._updateHtml();
		}
	});

	this.ContainerBorderBorderColour=setter(this, function() {
		return this.container_border_border_colour;
	}, function(value) {
		if(this.container_border_border_colour!==value) {
			this.container_border_border_colour=value;
			this._updateHtml();
		}
	});

	this.OverallWidth=setter(this, function() {
		return this.get_overall_size(X);
	});

	this.OverallHeight=setter(this, function() {
		return this.get_overall_size(Y);
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

	this.inner_container=div(this.node);

	style(this.inner_container, {
		position: "absolute"
	});

	/*
	board
	*/

	this.border_container=div(this.inner_container);

	style(this.border_container, {
		position: "absolute",
		zIndex: 0
	});

	this.board_container=div(this.inner_container);

	style(this.board_container, {
		position: "absolute",
		zIndex: 1
	});

	this.board_div=div(this.board_container);

	this.board_div.addEventListener("mouseout", function(e) {
		self._fireMouseOverEvents(e);
	});

	var coord, coord_outer, coord_inner;

	/*
	rank coords
	*/

	for(var i=0; i<8; i++) {
		coord_outer=div(this.inner_container);
		coord_inner=div(coord_outer);

		coord={
			Container: coord_outer,
			Node: coord_inner
		};

		this._rankCoords.push(coord);
	}

	/*
	file coords
	*/

	for(var i=0; i<8; i++) {
		coord_outer=div(this.inner_container);
		coord_inner=div(coord_outer);

		coord={
			Container: coord_outer,
			Node: coord_inner
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
				zIndex: UiBoard.SQ_ZINDEX_NORMAL
			});

			style(highlight, {
				position: "absolute",
				zIndex: UiBoard.SQ_ZINDEX_BELOW,
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
				Container: sq_outer,
				Node: sq_inner,
				No: Util.squareFromCoords([f, r]),
				Highlight: highlight
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
	this.PromoteDialog.Zindex(UiBoard.SQ_ZINDEX_ABOVE);
	this.PromoteDialog.ImgDirPiece(this.img_dir_piece);
	this.PromoteDialog.PieceStyle(this.piece_style);
	this.PromoteDialog.SquareSize(this._squareSize);

	/*
	game over dialog - this is part of the board to simplifiy positioning it
	and getting the zIndex right.
	*/

	this.GameOverDialog=new GameOverDialog(this.board_div);
	this.GameOverDialog.Zindex(UiBoard.SQ_ZINDEX_ABOVE);

	/*
	force resign dialog
	*/

	this.ForceResignDialog=new ForceResignDialog(this.board_div);
	this.ForceResignDialog.Zindex(UiBoard.SQ_ZINDEX_ABOVE);

	this._updateHtml();
}

/*
set the size, position and other style attributes on the elements
*/

UiBoard.prototype._updateHtml=function() { //after switching colours ,changing size tec
	var rank_index, file_index, text;
	var board_size=this.getBoardSize();
	var coord_size_r=this.CoordSizeR();
	var coord_size_f=this.CoordSizeF();
	var rankCoordsDisplaySize=this.show_coords_padding?coord_size_r:0;
	var fileCoordsDisplaySize=this.show_coords_padding?coord_size_f:0;
	var container_padding_r=this.container_border?coord_size_r:rankCoordsDisplaySize;
	var container_padding_f=this.container_border?coord_size_f:fileCoordsDisplaySize;
	var coords_display=this.show_coords_padding?"":"none";
	var coords_visibility=this.show_coords?"":"hidden";

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

	/*
	border
	*/

	this.border_container.innerHTML="";

	var border;
	var inner_border=this.border_container;

	for(var i=0; i<this.border.length; i++) {
		border=div(inner_border);

		style(border, {
			border: "1px solid "+this.border[i]
		});

		inner_border=border;
	}

	style(inner_border, {
		width: board_size,
		height: board_size
	});

	/*
	coords
	*/

	for(var i=0; i<8; i++) {
		style(this._rankCoords[i].Container, {
			position: "absolute",
			top: this.border.length+(this._squareSize*i),
			left: 0,
			height: this._squareSize,
			width: rankCoordsDisplaySize,
			display: coords_display,
			visibility: coords_visibility,
			cursor: "default"
		});

		style(this._fileCoords[i].Container, {
			position: "absolute",
			top: (this.border.length*2)+board_size,
			left: coord_size_r+this.border.length+(this._squareSize*i),
			width: this._squareSize,
			height: fileCoordsDisplaySize,
			display: coords_display,
			visibility: coords_visibility,
			cursor: "default"
		});


		if(this.view_as==WHITE) {
			rank_index=7-i;
			file_index=i;
		}

		else {
			rank_index=i;
			file_index=7-i;
		}


		this._rankCoords[i].Node.innerHTML=RANK.charAt(rank_index);

		style(this._rankCoords[i].Node, {
			marginTop: Math.round((this._squareSize/2)-(this.coords_font_size/2))-this.coord_r_hinting
		});


		this._fileCoords[i].Node.innerHTML=FILE.charAt(file_index);

		/*
		NOTE these styles that are set by props (_fileCoordsontColor etc) are unnecessarily
		intensive - if something sets the font size and then the colour a whole load of
		dom nodes are deleted and then recreated needlessly.  but the other way is to
		have separate update functions for each style option, or do them directly in the
		prop Sets (but then they wouldn't be applied initially unless the prop set was
		called in initialisation.  maybe some system where you can call a "initialise_props"
		method that knows all the properties that have been added and does
		this[prop](this[prop]()).  logic could even be tucked away nicely in the Property
		class if classes implemented IPropertyLogging for the list.)

		up to now these optimisations seem pointless as the board comes up without any
		noticeable delay on fairly old hardware, but if it starts getting slow this is
		probably most of the problem.

		noticeable pauses seem to arise with about 200 board._fileCoordsontColor.Set calls
		*/

		/*
		SOLUTION get rid of all the props, no point being able to change the font colour
		*/

		style(this._fileCoords[i].Node, {
			fontFamily: this.coords_font_family,
			fontSize: this.coords_font_size,
			fontWeight: "normal",
			color: this.coords_font_color,
			lineHeight: fileCoordsDisplaySize,
			textAlign: "center"
		});

		style(this._rankCoords[i].Node, {
			fontFamily: this.coords_font_family,
			fontSize: this.coords_font_size,
			color: this.coords_font_color,
			fontWeight: "normal",
			textAlign: "center"
		});
	}

	/*
	board
	*/

	style(this.node, {
		width: container_padding_r+(this.border.length*2)+board_size,
		height: container_padding_f+(this.border.length*2)+board_size
	});

	style(this.border_container, {
		top: 0,
		left: container_padding_r
	});

	style(this.board_container, {
		top: this.border.length,
		left: container_padding_r+this.border.length, //r is "rank" not "right"
		width: board_size,
		height: board_size
	});

	var bgimg="none";

	if(this.board_style!==null) {
		bgimg=Base.App.CssImg(this.img_dir_board+"/"+this.board_style+"/"+this._squareSize+".png");
	}

	style(this.board_div, {
		position: "absolute",
		width: board_size,
		height: board_size,
		backgroundImage: bgimg
	});

	/*
	squares
	*/

	var square;

	for(var sq=0; sq<this._uiSquares.length; sq++) {
		square=this._uiSquares[sq];

		style(square.Container, {
			width: this._squareSize,
			height: this._squareSize,
			backgroundColor: "#"+this.square_colour[Util.getSquareColour(sq)]
		});

		this._setSquarePos(square, sq);

		style(square.Node, {
			width: this._squareSize,
			height: this._squareSize
		});

		style(square.Highlight, {
			width: this._squareSize-(this.square_highlight_border*2),
			height: this._squareSize-(this.square_highlight_border*2),
			borderWidth: this.square_highlight_border
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
		bgimg="url("+this.img_dir_piece+"/"+this.piece_style+"/"+this._squareSize+"/"+Fen.getPieceChar(pc)+".png)";
	}

	if(this._uiSquares[sq].Node.style.backgroundImage!==bgimg) { //performance is noticeably better with this check
		this._uiSquares[sq].Node.style.backgroundImage=bgimg;
	}
}

UiBoard.prototype._updateSquares=function() {
	for(var sq=0; sq<this.board.length; sq++) {
		this._setHtmlSquare(sq, this.board[sq]);
	}
}

UiBoard.prototype.squareFromMouseEvent=function(e, use_offsets, offsets) { //useoffsets to calc for middle of piece
	offsets=offsets||[this.moveInfo.OffsetX, this.moveInfo.OffsetY];

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

	if(this.view_as==BLACK) {
		f=7-f;
		r=7-r;
	}

	return Util.squareFromCoords([f, r]);
}

UiBoard.prototype._setSquarePos=function(square, sq) {
	var x, y;
	var r=Util.yFromSquare(sq);
	var f=Util.xFromSquare(sq);

	if(this.view_as==BLACK) {
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

	style(square.Container, {
		top: y,
		left: x
	});
}

UiBoard.prototype._resetSquarePos=function(uiSquare) { //return the inner bit to its container pos
	style(uiSquare.Node, {
		top: 0,
		left: 0
	});
}

UiBoard.prototype._setSquareXyPos=function(square, x, y) { //takes mouse coords
	var os=getoffsets(square.Container);

	style(square.Node, {
		top: y-os[Y],
		left: x-os[X]
	});
}

UiBoard.prototype._boardMouseDown=function(e) {
	e.preventDefault();

	if(this.mouseIsOnBoard(e)) {
		var sq=this.squareFromMouseEvent(e);
		var uiSquare=this._uiSquares[sq];
		var os=getoffsets(uiSquare.Container);

		if(this.moveMode!==MoveInfo.NONE && !this.moveInfo.Selected && !this.moveInfo.isInProgress && this.board[sq]!==SQ_EMPTY) { //first click or start of drag
			this._setZIndexAboveRest(uiSquare);
			this.moveInfo.Selected=true;
			this.moveInfo.from=sq;
			this.moveInfo.Piece=this.board[sq];
			this.moveInfo.OffsetX=e.pageX-os[X];
			this.moveInfo.OffsetY=e.pageY-os[Y];
		}
	}
}

UiBoard.prototype._boardMouseMove=function(e) {
	e.preventDefault();

	var sq=this.squareFromMouseEvent(e);

	//update mouseover sq and fire events

	this._fireMouseOverEvents(e);
	this._firePieceDragEvents(e);

	var args;

	if(this.moveInfo.Selected && !this.moveInfo.isInProgress) { //down and not already up on same square
		args={
			Square: sq,
			Piece: this.board[sq],
			Dragging: true,
			Cancel: false
		};

		this.SelectPiece.fire(args);

		if(args.Cancel) {
			this.moveInfo.reset();
			this._resetZIndex(this._uiSquares[sq]);
		}

		else {
			this.moveInfo.mode=MoveInfo.DRAG_DROP;
			this.moveInfo.isInProgress=true;
			this.PieceSelected.fire({Sq: sq});
		}
	}

	if(this.moveInfo.Selected && this.moveInfo.mode===MoveInfo.DRAG_DROP) {
		args={
			Square: sq,
			Piece: this.moveInfo.Piece,
			Cancel: false
		};

		this.DragMove.fire(args);

		if(!args.Cancel) {
			this._setSquareXyPos(this._uiSquares[this.moveInfo.from], e.pageX-this.moveInfo.OffsetX, e.pageY-this.moveInfo.OffsetY);
		}
	}
}

UiBoard.prototype._boardMouseUp=function(e) {
	e.preventDefault();

	var args;

	var sq=this.squareFromMouseEvent(e);

	if(this.moveInfo.isInProgress && this.moveInfo.mode===MoveInfo.DRAG_DROP) {
		sq=this.squareFromMouseEvent(e, true, [this.moveInfo.OffsetX, this.moveInfo.OffsetY]); //where the middle of the piece is
	}

	var fromUiSquare=null;

	if(this.moveInfo.from!==null) {
		fromUiSquare=this._uiSquares[this.moveInfo.from];
	}

	args={
		Square: sq,
		MoveInfo: this.moveInfo,
		Cancel: false,
		Event: e
	};

	if(this.moveInfo.mode===MoveInfo.CLICK) {
		this.SquareClicked.fire(args);
	}

	else if(this.moveInfo.mode===MoveInfo.DRAG_DROP && this.moveInfo.isInProgress) {
		this.DragDrop.fire(args);
	}

	if(!args.Cancel) {
		if(this.moveInfo.isInProgress) { //was dragging, now dropped; or second click
			this.Deselected.fire();

			if(this.mouseIsOnBoard(e, true)) {
				if(sq!=this.moveInfo.from) {
					this.UserMove.fire({
						From: this.moveInfo.from,
						To: sq,
						Piece: this.getSquare(this.moveInfo.from),
						Event: e
					});
				}
			}

			else {
				this.PieceDraggedOff.fire({
					From: this.moveInfo.from
				});
			}

			this._resetSquarePos(fromUiSquare);
			this.moveInfo.reset();
		}

		else if(this.moveMode&MoveInfo.CLICK && this.moveInfo.Selected && sq===this.moveInfo.from && !this.moveInfo.isInProgress) { //clicking on first square
			args={
				Square: sq,
				Piece: this.board[sq],
				Dragging: false,
				Cancel: false
			};

			this.SelectPiece.fire(args);

			if(args.Cancel) {
				this.moveInfo.reset();
			}

			else {
				this.moveInfo.isInProgress=true;
				this.moveInfo.mode=MoveInfo.CLICK;
				this.PieceSelected.fire({Sq: sq});
			}
		}
	}

	else {
		if(fromSquare!==null) {
			this._resetSquarePos(fromUiSquare);
		}

		this.moveInfo.reset();
	}

	if(fromUiSquare!==null) {
		this._resetZIndex(fromUiSquare);
	}

	this._firePieceDragEvents(e);
}

UiBoard.prototype._setZIndexAboveRest=function(square) {
	style(square.Node, {
		zIndex: UiBoard.SQ_ZINDEX_ABOVE
	});
}

UiBoard.prototype._resetZIndex=function(square) {
	style(square.Node, {
		zIndex: UiBoard.SQ_ZINDEX_NORMAL
	});
}

UiBoard.prototype.mouseIsOnBoard=function(e, use_offsets, offsets) {
	offsets=offsets||[this.moveInfo.OffsetX, this.moveInfo.OffsetY];

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

	return this.coords_on_board(x, y);
}

UiBoard.prototype.coords_on_board=function(x, y) {
	return !(x<0 || x>this.getBoardSize() || y<0 || y>this.getBoardSize());
}

/*
look at all these fucking functions for highlighting squares

and ones for fucking unhighlighting squares as well
*/

UiBoard.prototype.hiliteSq=function(sq, style) {
	style(this._uiSquares[sq].Highlight, style);
}

UiBoard.prototype.unhiliteSq=function(sq) {
	if(sq!==null) {
		style(this._uiSquares[sq].Highlight, this.HlNone);
	}
}

UiBoard.prototype.hilitePossibilities=function(sqs) {
	for(var i=0; i<this.HilitPossibilities.length; i++) {
		this.unhiliteSq(this.HilitPossibilities[i]);
	}

	this.HilitPossibilities=sqs;

	for(var i=0; i<this.HilitPossibilities.length; i++) {
		this.hiliteSq(this.HilitPossibilities[i], this.HlPossibility);
	}
}

UiBoard.prototype.hiliteLastMoveFrom=function(sq) {
	this.unhiliteSq(this.HilitLastMoveFrom);
	this.HilitLastMoveFrom=sq;
	this.hiliteSq(sq, this.HlLastMoveFrom);
}

UiBoard.prototype.hiliteLastMoveTo=function(sq) {
	this.unhiliteSq(this.HilitLastMoveTo);
	this.HilitLastMoveTo=sq;
	this.hiliteSq(sq, this.HlLastMoveTo);
}

UiBoard.prototype.hiliteCanSelect=function(sq) {
	this.unhiliteSq(this.HilitCanSelect);
	this.HilitCanSelect=sq;
	this.hiliteSq(sq, this.HlCanSelect);
}

UiBoard.prototype.hiliteCanDrop=function(sq) {
	this.unhiliteSq(this.HilitCanDrop);
	this.HilitCanDrop=sq;
	this.hiliteSq(sq, this.HlCanDrop);
}

UiBoard.prototype.hiliteSelected=function(sq) {
	this.unhiliteSq(this.HilitSelected);
	this.HilitSelected=sq;
	this.hiliteSq(sq, this.HlSelected);
}

UiBoard.prototype.unhilitePossibilities=function() {
	for(var i=0; i<this.HilitPossibilities.length; i++) {
		this.unhiliteSq(this.HilitPossibilities[i]);
	}

	this.HilitPossibilities=[];
}

UiBoard.prototype.unhiliteLastMoveFrom=function() {
	this.unhiliteSq(this.HilitLastMoveFrom);
	this.HilitLastMoveFrom=null;
}

UiBoard.prototype.unhiliteLastMoveTo=function() {
	this.unhiliteSq(this.HilitLastMoveTo);
	this.HilitLastMoveTo=null;
}

UiBoard.prototype.unhiliteCanSelect=function() {
	this.unhiliteSq(this.HilitCanSelect);
	this.HilitCanSelect=null;
}

UiBoard.prototype.unhiliteCanDrop=function() {
	this.unhiliteSq(this.HilitCanDrop);
	this.HilitCanDrop=null;
}

UiBoard.prototype.unhiliteSelected=function() {
	this.unhiliteSq(this.HilitSelected);
	this.HilitSelected=null;
}

UiBoard.prototype.getBoardSize=function() {
	return this._squareSize*8;
}

/*
FIXME these fire events and set some variables, should probs be renamed
*/

UiBoard.prototype._fireMouseOverEvents=function(e) {
	var sq=this.squareFromMouseEvent(e);

	if(this.mouseIsOnBoard(e) && sq>-1 && sq<64) { //mouseIsOnBoard doesn't appear to be enough
		if(this._squareMouseCurrentlyOver!=sq) {
			if(this._squareMouseCurrentlyOver!==null) {
				this.MouseLeavingSquare.fire({
					Sq: this._squareMouseCurrentlyOver
				});
			}

			this._squareMouseCurrentlyOver=sq;

			this.MouseOverSquare.fire({
				Sq: sq
			});
		}
	}

	else {
		if(this._squareMouseCurrentlyOver!==null) {
			this.MouseLeavingSquare.fire({
				Sq: this._squareMouseCurrentlyOver
			});
		}

		this._squareMouseCurrentlyOver=null;
	}
}

UiBoard.prototype._firePieceDragEvents=function(e) {
	var square=this.squareFromMouseEvent(e, true);

	if(this.moveInfo.isInProgress && this.moveInfo.mode==MoveInfo.DRAG_DROP) {
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
	if(this.moveInfo.isInProgress) {
		this._resetZIndex(this._uiSquares[this.moveInfo.from]);
		this.moveInfo.reset();
	}
}

UiBoard.prototype.setFen=function(fen) {
	Board.prototype.setFen.call(this, fen);
	this._updateSquares();
}

UiBoard.prototype.animateMove=function(piece, fs, ts, callback) {
	//animate the move

	//console.log("animating "+Fen.getPieceChar(piece)+" "+fs+" "+ts); //DEBUG

	//this will have to be moved into a callback passed to whatever is used for the animation:

	if(is_function(callback)) {
		callback();
	}
}

UiBoard.prototype.get_overall_size=function(dimension) {
	var coord_size=[this.coord_size_r, this.coord_size_f][dimension];

	return (
		this.getBoardSize()
		+this.border.length*2
		+(this.container_border?coord_size:0)
		+(this.show_coords_padding?coord_size:0)
		+(this.container_border?(this.container_border_border_width*2):0)
	);
}
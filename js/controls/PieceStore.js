/*
NOTE don't use square offsets when dropping onto a board - it might have a different square size
*/

/*
NOTE for updating this in the future - MoveInfo is a complete wreck.
definition is in ResetMoveInfo.  used in all kinds of places, don't
bother trying to edit.
*/

function PieceStore(parent) {
	Control.implement(this, parent, true);

	//width and height defined here because it's not the standard 8x8
	//uses a custom fr_to_sq because the Util one doesn't accept
	//different board dimensions

	this.width=2;
	this.height=7;

	this.hold_cb_container=null;
	this.hold_checkbox=null;

	this.Squares=[];
	this.SelectedPiece=null;

	this.Board=[];

	this.Board.push(SQ_EMPTY); //0th
	this.Board.push(null); //1st

	this.NULL_SQ=1; //don't do anything if sq is this (bottom right square)
	var offset=2; //start pieces after the empty and the null

	var pc, r, f;

	r=0;
	f=0;

	for(var pc=WHITE_PAWN; pc<=WHITE_KING; pc++) {
		this.SetBoardSquare(this.fr_to_sq(f, r)+offset, pc);
		r++;
	}

	r=0;
	f=1;

	for(var pc=BLACK_PAWN; pc<=BLACK_KING; pc++) {
		this.SetBoardSquare(this.fr_to_sq(f, r)+offset, pc);
		r++;
	}

	//Events

	this.PieceDropped=new Event(this);

	this.MoveInfo={};
	this.ResetMoveInfo();

	//Properties

	this.border=["#686868"]; //colour of each pixel of border, from outside to inside
	this.square_size=30;
	this.img_dir_piece=null;
	this.piece_style=PIECE_STYLE_ALPHA;

	this.ImgDirPiece=new Property(this, function() {
		return this.img_dir_piece;
	}, function(value) {
		this.img_dir_piece=value;
		this.UpdateHtml();
	});

	this.SquareSize=new Property(this, function() {
		return this.square_size;
	}, function(value) {
		this.square_size=value;
		this.UpdateHtml();
	});

	this.PieceStyle=new Property(this, function() {
		return this.piece_style;
	}, function(value) {
		this.piece_style=value;
		this.UpdateHtml();
	});

	this.Border=new Property(this, function() {
		return this.border;
	}, function(value) {
		this.border=value;
		this.SetupHtml();
	});

	this.Hold=new Property(this, function() {
		return this.hold_checkbox.checked;
	}, function(value) {
		this.hold_checkbox.checked=value;
	});

	this.SetupHtml();
}

//bit-field constants

PieceStore.CLICK_STATE_MOUSEDOWN=1;
PieceStore.CLICK_STATE_DRAGGING=2;

/*
destroy/re-create all the elements
*/

PieceStore.prototype.SetupHtml=function() { //after changing style (border)
	Dom.ClearNode(this.Node);

	var self=this;

	this.Squares=[];

	/*
	board
	*/

	this.board_container=$("*div");
	this.Node.appendChild(this.board_container);

	var border;
	var parent=this.board_container;

	for(var i=0; i<this.border.length; i++) {
		border=$("*div");
		parent.appendChild(border);

		Dom.Style(border, {
			border: "1px solid "+this.border[i]
		});

		parent=border;
	}

	this.board=$("*div");
	parent.appendChild(this.board);

	/*
	squares
	*/

	var square, sq_outer, sq_inner;

	for(var r=0; r<this.height; r++) {
		for(var f=0; f<this.width; f++) {
			sq_outer=$("*div");
			sq_inner=$("*div");

			this.board.appendChild(sq_outer);
			sq_outer.appendChild(sq_inner);

			Dom.AddEventHandler(sq_inner, "mousedown", function(e) {
				self.BoardMouseDown(e);
			});

			Dom.AddEventHandler(sq_inner, "mouseup", function(e) {
				self.BoardMouseUp(e);
			});

			//Dom.AddEventHandler(sq_inner, "mousemove", function(e) {
			//	self.BoardMouseMove(e);
			//});

			square={
				Container: sq_outer,
				Node: sq_inner
			};

			this.Squares.push(square);
		}
	}

	/*
	"Hold" checkbox
	*/

	var id=Base.GetId();

	this.hold_cb_container=$("*div");
	this.Node.appendChild(this.hold_cb_container);

	this.hold_checkbox=$("*input");

	this.hold_cb_container.appendChild(this.hold_checkbox);
	this.hold_checkbox.setAttribute("type", "checkbox");
	this.hold_checkbox.setAttribute("id", id);

	var label=$("*label");
	this.hold_cb_container.appendChild(label);
	label.setAttribute("for", id);

	label.appendChild($("%Hold"));

	this.UpdateHtml();

	/*
	mousemove
	*/

	Dom.AddEventHandler(Dom.GetBody(), "mousemove", function(e) {
		self.BoardMouseMove(e);
	});
}

/*
set the size, position and other style attributes on the elements
*/

PieceStore.prototype.UpdateHtml=function() { //after switching colours ,changing size tec
	var os=Dom.GetOffsets(this.Node);
	var board_size_w=this.GetBoardSizeW();
	var board_size_h=this.GetBoardSizeH();

	/*
	board
	*/

	Dom.Style(this.board, {
		width: board_size_w,
		height: board_size_h
	});

	Dom.Style(this.Node, {
		width: (this.border.length*2)+board_size_w,
		height: (this.border.length*2)+board_size_h+this.hold_cb_container.offsetHeight
	});

	Dom.Style(this.board_container, {
		position: "absolute",
		top: os[Y],
		left: os[X]
	});

	/*
	squares
	*/

	var board_os=Dom.GetOffsets(this.board);
	var square;

	for(var sq=0; sq<this.Squares.length; sq++) {
		square=this.Squares[sq];

		Dom.Style(square.Container, {
			position: "absolute",
			width: this.square_size,
			height: this.square_size
		});

		this.SetSquarePos(square, sq);

		Dom.Style(square.Node, {
			position: "absolute",
			width: this.square_size,
			height: this.square_size
		});
	}

	/*
	pieces
	*/

	this.UpdateSquares();

	/*
	Hold cb
	*/

	Dom.Style(this.hold_cb_container, {
		position: "absolute",
		top: os[Y]+(this.Node.offsetHeight-this.hold_cb_container.offsetHeight),
		left: os[X],
		padding: 0
	});
}

PieceStore.prototype.SetSquare=function(sq, pc) {
	this.SetBoardSquare(sq, pc);
	this.SetHtmlSquare(sq, pc);
}

PieceStore.prototype.SetBoardSquare=function(sq, pc) {
	this.Board[sq]=pc;
}

PieceStore.prototype.SetHtmlSquare=function(sq, pc) {
	if(this.GetSquare(sq)!==null) {
		if(this.img_dir_piece!==null) {
			this.Squares[sq].Node.style.backgroundImage=Base.App.CssImg(this.img_dir_piece+"/"+this.piece_style+"/"+this.square_size+"/"+Fen.get_piece_char(pc)+".png");
		}
	}
}

PieceStore.prototype.UpdateSquares=function() {
	for(var sq=0; sq<this.Board.length; sq++) {
		this.SetHtmlSquare(sq, this.Board[sq]);
	}
}

PieceStore.prototype.GetSquare=function(sq) {
	return this.Board[sq];
}

PieceStore.prototype.GetBoardSizeW=function() {
	return this.square_size*this.width;
}

PieceStore.prototype.GetBoardSizeH=function() {
	return this.square_size*this.height;
}

PieceStore.prototype.x=function(sq) {
	return (sq%this.width);
}

PieceStore.prototype.y=function(sq) {
	return ((sq-this.x(sq))/this.width);
}

PieceStore.prototype.SetSquarePos=function(square, sq) {
	var x, y;
	var r=this.y(sq);
	var f=this.x(sq);

	x=this.square_size*f;
	y=this.square_size*((this.height-1)-r);

	Dom.Style(square.Container, {
		top: this.border.length+y,
		left: this.border.length+x
	});
}

PieceStore.prototype.ResetSquarePos=function(square) { //return the inner bit to its container pos
	Dom.Style(square.Node, {
		top: 0,
		left: 0
	});
}

PieceStore.prototype.SetSquareXyPos=function(square, x, y) { //takes mouse coords
	var os=Dom.GetOffsets(square.Container);

	Dom.Style(square.Node, {
		top: y-os[Y],
		left: x-os[X]
	});
}

PieceStore.prototype.sq_from_mouse_event=function(e) {
	var os=Dom.GetOffsets(this.board);

	return this.sq_from_offsets(e.pageX-os[X], this.GetBoardSizeH()-(e.pageY-os[Y]));
}

PieceStore.prototype.sq_from_offsets=function(x, y) {
	var f=(x-(x%this.square_size))/this.square_size;
	var r=(y-(y%this.square_size))/this.square_size;

	return this.fr_to_sq(f, r);
}

PieceStore.prototype.ResetMoveInfo=function() {
	this.MoveInfo={
		MouseDown: false,
		MouseDownSq: null,
		Selected: false,
		Clicked: false,
		Dragging: false,
		Piece: null,
		From: null,
		OffsetX: 0,
		OffsetY: 0
	};

	this.SelectedPiece=null; //TODO could do to not have a separate thing for this
}

PieceStore.prototype.BoardMouseDown=function(e) {
	e.preventDefault();

	if(this.MouseOnBoard(e)) {
		var sq=this.sq_from_mouse_event(e);
		var square=this.Squares[sq];
		var os=Dom.GetOffsets(square.Container);

		if(sq!==this.NULL_SQ) {
			this.inc_z_index(square);

			if(!this.MoveInfo.Selected) { //first click or start of drag
				this.MoveInfo.Selected=true;
				this.MoveInfo.MouseDown=true;
				this.MoveInfo.From=sq;
				this.MoveInfo.Piece=this.Board[sq];
				this.MoveInfo.OffsetX=e.pageX-os[X];
				this.MoveInfo.OffsetY=e.pageY-os[Y];
			}
		}
	}
}

PieceStore.prototype.BoardMouseMove=function(e) {
	e.preventDefault();

	if(this.MoveInfo.MouseDown) { //down and not already up on same square
		this.MoveInfo.Dragging=true;
	}

	if(this.MoveInfo.Selected && this.MoveInfo.Dragging) {
		this.SetSquareXyPos(this.Squares[this.MoveInfo.From], e.pageX-this.MoveInfo.OffsetX, e.pageY-this.MoveInfo.OffsetY);
	}
}

PieceStore.prototype.BoardMouseUp=function(e) {
	e.preventDefault();

	var sq=this.sq_from_mouse_event(e);
	var from_square=this.Squares[this.MoveInfo.From];

	this.MoveInfo.MouseDown=false;
	this.SelectedPiece=null;

	if(this.MoveInfo.Dragging) {
		if(!this.MouseOnBoard(e)) {
			this.PieceDropped.Fire({
				Piece: this.Board[this.MoveInfo.From],
				Event: e,
				MoveInfo: this.MoveInfo
			});
		}

		this.ResetSquarePos(from_square);
		this.ResetMoveInfo();
		this.reset_z_index(from_square);
	}

	else if(sq!==this.NULL_SQ) {
		if(this.MoveInfo.Clicked && sq==this.MoveInfo.From) {
			this.UnHighlightSq(this.MoveInfo.From);
			this.ResetMoveInfo();
		}

		else {
			this.UnHighlightSq(this.MoveInfo.From);
			this.MoveInfo.Clicked=true;
			this.HighlightSq(sq);
			this.MoveInfo.From=sq;
			this.MoveInfo.Piece=this.Board[sq];
			this.SelectedPiece=this.Board[sq];
		}
	}
}

PieceStore.prototype.inc_z_index=function(square) {
	Dom.Style(square.Node, {
		zIndex: UiBoard.SQ_ZINDEX_ABOVE
	});
}

PieceStore.prototype.reset_z_index=function(square) {
	Dom.Style(square.Node, {
		zIndex: UiBoard.SQ_ZINDEX_NORMAL
	});
}

PieceStore.prototype.MouseOnBoard=function(e) {
	var x=e.pageX;
	var y=e.pageY;
	var os=Dom.GetOffsets(this.board);

	var top=os[Y]+1;
	var right=os[X]+this.GetBoardSizeW()-1;
	var bottom=os[Y]+this.GetBoardSizeH()-1;
	var left=os[X]+1;

	return !(x<left || x>right || y<top || y>bottom);
}

PieceStore.prototype.HighlightSq=function(sq) {
	Dom.Style(this.Squares[sq].Container, {
		backgroundColor: "#808080"
	});
}

PieceStore.prototype.UnHighlightSq=function(sq) {
	Dom.Style(this.Squares[sq].Container, {
		backgroundColor: "inherit"
	});
}

PieceStore.prototype.fr_to_sq=function(f, r) {
	return (r*this.width+f);
}

PieceStore.prototype.Deselect=function() {
	if(this.MoveInfo.Clicked) {
		this.UnHighlightSq(this.MoveInfo.From);
		this.ResetMoveInfo();
	}
}
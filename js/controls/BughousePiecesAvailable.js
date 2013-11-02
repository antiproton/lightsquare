/*
NOTE there can be 2 things simultaneously updating the amount of
pieces available (capture moves in one game and drop moves in the
other) so to allow things to even out during initial load of the
histories it is possible to set the amount of pieces available to
a negative number.

NOTE this will automatically set its colour to the colour of any
piece that gets added to it.  The colour can also be changed manually.
*/

function BughousePiecesAvailable(parent) {
	Control.implement(this, parent);

	this.width=2;
	this.height=3;
	this.piece_types=[PAWN, KNIGHT, BISHOP, ROOK, QUEEN];
	this.colour=WHITE;
	this.Squares=[];

	this.PiecesAvailable=[];

	for(var i=0; i<this.piece_types.length; i++) {
		this.PiecesAvailable[this.piece_types[i]]=0;
	}

	//Events

	this.PieceDropped=new Event(this);
	this.SelectPiece=new Event(this);

	this.MoveMode=UiBoard.MOVE_MODE_DRAG_DROP;
	this.MoveInfo={};
	this.ResetMoveInfo();

	//Properties

	this.square_size=45;
	this.img_dir_piece=ap("/img/board/piece");
	this.piece_style=Base.App.User.Prefs.PieceStyle.Get();

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

	this.Colour=new Property(this, function() {
		return this.colour;
	}, function(value) {
		this.colour=value;
		this.UpdateHtml();
	});

	Base.App.User.Prefs.PieceStyleChanged.AddHandler(this, function(data, sender) {
		this.PieceStyle.Set(sender.PieceStyle.Get());
	});

	this.SetupHtml();
}

BughousePiecesAvailable.prototype.SetupHtml=function() {
	var self=this;

	Dom.Style(this.Node, {
		border: "1px solid #cbcbcb"
	});

	this.board=div(this.Node);

	Dom.Style(this.board, {
		position: "absolute"
	});

	var type, square, sq_outer, sq_inner, amount_display;

	for(var i=0; i<this.piece_types.length; i++) {
		type=this.piece_types[i];
		sq_outer=div(this.board);
		sq_inner=div(sq_outer);
		amount_display=div(sq_outer);

		square={
			Container: sq_outer,
			Node: sq_inner,
			AmountDisplay: amount_display,
			Type: type
		};

		Dom.Style(sq_outer, {
			position: "absolute"
		});

		Dom.Style(sq_inner, {
			position: "absolute"
		});

		Dom.Style(amount_display, {
			fontSize: 9,
			color: "#263ebc",
			position: "absolute",
			top: 0,
			right: 0,
			//border: "1px solid #767676",
			//padding: 2,
			//backgroundColor: "#ffffff"
		});

		Dom.AddEventHandler(sq_inner, "mousedown", (function(sq) {
			return function(e) {
				self.BoardMouseDown(sq, e);
			};
		})(square));

		Dom.AddEventHandler(sq_inner, "mouseup", (function(sq) {
			return function(e) {
				self.BoardMouseUp(sq, e);
			};
		})(square));

		Dom.AddEventHandler(window, "mousemove", function(e) {
			self.BoardMouseMove(e);
		});

		amount_display.innerHTML="3";

		this.Squares.push(square);
	}

	this.UpdateHtml();
}

BughousePiecesAvailable.prototype.UpdateHtml=function() {
	var width=this.width*this.square_size;
	var height=this.height*this.square_size;

	Dom.Style(this.Node, {
		width: width,
		height: height
	});

	Dom.Style(this.board, {
		width: width,
		height: height
	});

	var row=0;
	var col=0;

	var type, piece, square, amt;

	for(var i=0; i<this.Squares.length; i++) {
		square=this.Squares[i];
		type=this.piece_types[i];
		piece=Util.piece(type, this.colour);
		amt=this.PiecesAvailable[type];

		if(col>=this.width) {
			row++;
			col=0;
		}

		Dom.Style(square.Container, {
			display: (amt>0)?"block":"none",
			top: row*this.square_size,
			left: col*this.square_size,
			width: this.square_size,
			height: this.square_size
		});

		Dom.Style(square.Node, {
			width: this.square_size,
			height: this.square_size,
			backgroundImage: Dom.CssUrl(this.img_dir_piece+"/"+this.piece_style+"/"+this.square_size+"/"+Fen.get_piece_char(piece)+".png")
		});

		//Dom.Style(square.AmountDisplay, {
		//	display: (amt>1)?"block":"none"
		//});

		square.AmountDisplay.innerHTML=amt;

		col++;
	}
}

BughousePiecesAvailable.prototype.Clear=function() {
	for(var i=0; i<this.piece_types.length; i++) {
		this.PiecesAvailable[this.piece_types[i]]=0;
	}

	this.UpdateHtml();
}

BughousePiecesAvailable.prototype.Add=function(piece) {
	if(Util.colour(piece)===this.colour) {
		this.PiecesAvailable[Util.type(piece)]++;
		this.UpdateHtml();
	}
}

BughousePiecesAvailable.prototype.Remove=function(piece) {
	if(Util.colour(piece)===this.colour) {
		this.PiecesAvailable[Util.type(piece)]--;
		this.UpdateHtml();
	}
}

BughousePiecesAvailable.prototype.x=function(sq) {
	return (sq%this.width);
}

BughousePiecesAvailable.prototype.y=function(sq) {
	return ((sq-this.x(sq))/this.width);
}

BughousePiecesAvailable.prototype.SetSquarePos=function(square, sq) {
	var x, y;
	var r=this.y(sq);
	var f=this.x(sq);

	x=this.square_size*f;
	y=this.square_size*((this.height-1)-r);

	Dom.Style(square.Container, {
		top: y,
		left: x
	});
}

BughousePiecesAvailable.prototype.ResetSquarePos=function(square) { //return the inner bit to its container pos
	Dom.Style(square.Node, {
		top: 0,
		left: 0
	});
}

BughousePiecesAvailable.prototype.SetSquareXyPos=function(square, x, y) { //takes mouse coords
	var os=Dom.GetOffsets(square.Container);

	Dom.Style(square.Node, {
		top: y-os[Y],
		left: x-os[X]
	});
}

BughousePiecesAvailable.prototype.ResetMoveInfo=function() {
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

	this.SelectedPiece=null;
}

BughousePiecesAvailable.prototype.BoardMouseDown=function(square, e) {
	e.preventDefault();

	if(this.MouseOnBoard(e) && this.PiecesAvailable[square.Type]>0) {
		var os=Dom.GetOffsets(square.Container);
		this.inc_z_index(square);

		if(!this.MoveInfo.Selected) { //first click or start of drag
			var data={
				Piece: Util.piece(square.Type, this.colour),
				Cancel: false
			};

			this.SelectPiece.Fire(data);

			if(!data.Cancel) {
				this.MoveInfo.Selected=true;
				this.MoveInfo.MouseDown=true;
				this.MoveInfo.From=square;
				this.MoveInfo.Piece=Util.piece(square.Type, this.colour);
				this.MoveInfo.OffsetX=e.pageX-os[X];
				this.MoveInfo.OffsetY=e.pageY-os[Y];
			}
		}
	}
}

BughousePiecesAvailable.prototype.BoardMouseMove=function(e) {
	e.preventDefault();

	if(this.MoveInfo.MouseDown) { //down and not already up on same square
		this.MoveInfo.Dragging=true;
	}

	if(this.MoveInfo.Selected && this.MoveInfo.Dragging) {
		this.SetSquareXyPos(this.MoveInfo.From, e.pageX-this.MoveInfo.OffsetX, e.pageY-this.MoveInfo.OffsetY);
	}
}

BughousePiecesAvailable.prototype.BoardMouseUp=function(square, e) {
	e.preventDefault();

	var from_square=this.MoveInfo.From;

	this.MoveInfo.MouseDown=false;
	this.SelectedPiece=null;

	if(this.MoveInfo.Dragging) {
		if(!this.MouseOnBoard(e)) {
			this.PieceDropped.Fire({
				Piece: this.MoveInfo.Piece,
				Event: e,
				MoveInfo: this.MoveInfo
			});
		}

		this.ResetSquarePos(from_square);
		this.ResetMoveInfo();
		this.reset_z_index(from_square);
	}

	else {
		this.ResetMoveInfo();
	}
}

BughousePiecesAvailable.prototype.inc_z_index=function(square) {
	Dom.Style(square.Node, {
		zIndex: UiBoard.SQ_ZINDEX_ABOVE
	});
}

BughousePiecesAvailable.prototype.reset_z_index=function(square) {
	Dom.Style(square.Node, {
		zIndex: UiBoard.SQ_ZINDEX_NORMAL
	});
}

BughousePiecesAvailable.prototype.MouseOnBoard=function(e) {
	var x=e.pageX;
	var y=e.pageY;
	var os=Dom.GetOffsets(this.board);

	var top=os[Y]+1;
	var right=os[X]+this.GetBoardSizeW()-1;
	var bottom=os[Y]+this.GetBoardSizeH()-1;
	var left=os[X]+1;

	return !(x<left || x>right || y<top || y>bottom);
}

BughousePiecesAvailable.prototype.HighlightSq=function(square) {
	Dom.Style(square.Container, {
		backgroundColor: "#808080"
	});
}

BughousePiecesAvailable.prototype.UnHighlightSq=function(square) {
	Dom.Style(square.Container, {
		backgroundColor: "inherit"
	});
}

BughousePiecesAvailable.prototype.fr_to_sq=function(f, r) {
	return (r*this.width+f);
}

BughousePiecesAvailable.prototype.GetBoardSizeW=function() {
	return this.square_size*this.width;
}

BughousePiecesAvailable.prototype.GetBoardSizeH=function() {
	return this.square_size*this.height;
}

BughousePiecesAvailable.prototype.Deselect=function() {
	if(this.MoveInfo.Clicked) {
		this.UnHighlightSq(this.MoveInfo.From);
		this.ResetMoveInfo();
	}
}
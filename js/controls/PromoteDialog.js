function PromoteDialog(parent) {
	Control.implement(this, parent);

	this.PieceSelected=new Event(this);

	this.pieces=[QUEEN, ROOK, BISHOP, KNIGHT];
	this.squares=[];

	this.border_colour="#000000";
	this.border_width=1;
	this.colour=WHITE;
	this.square_size=45;
	this.img_dir_piece=null;
	this.piece_style=null;
	this.pointer_cursor=true;
	this.pos=[0, 0];
	this.z_index="1";
	this.visible=false;

	this.init_props();

	this.SetupHtml();
}

PromoteDialog.prototype.init_props=function() {
	this.Zindex=setter(this, function() {
		return this.z_index;
	}, function(value) {
		this.z_index=value;
		this.UpdateHtml();
	});

	this.Position=setter(this, function() {
		return this.pos;
	}, function(value) {
		this.pos=value;
		this.UpdateHtml();
	});

	this.PositionX=setter(this, function() {
		return this.pos[X];
	}, function(value) {
		this.pos[X]=value;
		this.UpdateHtml();
	});

	this.PositionY=setter(this, function() {
		return this.pos[Y];
	}, function(value) {
		this.pos[Y]=value;
		this.UpdateHtml();
	});

	this.BorderColour=setter(this, function() {
		return this.border_colour;
	}, function(value) {
		this.border_colour=value;
		this.UpdateHtml();
	});

	this.BorderWidth=setter(this, function() {
		return this.border_width;
	}, function(value) {
		this.border_width=value;
		this.UpdateHtml();
	});

	this.PointerCursor=setter(this, function() {
		return this.pointer_cursor;
	}, function(value) {
		this.pointer_cursor=value;
		this.UpdateHtml();
	});

	this.ImgDirPiece=setter(this, function() {
		return this.img_dir_piece;
	}, function(value) {
		this.img_dir_piece=value;
		this.UpdateHtml();
	});

	this.SquareSize=setter(this, function() {
		return this.square_size;
	}, function(value) {
		this.square_size=value;
		this.UpdateHtml();
	});

	this.PieceStyle=setter(this, function() {
		return this.piece_style;
	}, function(value) {
		this.piece_style=value;
		this.UpdateHtml();
	});

	this.Colour=setter(this, function() {
		return this.colour;
	}, function(value) {
		this.colour=value;
		this.UpdateHtml();
	});
}

PromoteDialog.prototype.SetupHtml=function() {
	var self=this;

	this.board_container=div(this.node);

	style(this.node, {
		position: "absolute"
	});

	var node, piece;

	for(var i=0; i<this.pieces.length; i++) {
		node=div(this.board_container);
		piece=this.pieces[i];

		node.addEventListener("click", (function(piece) {
			return function(e) {
				self.PieceSelected.Fire({
					Type: piece,
					Colour: self.colour,
					Piece: Util.piece(piece, WHITE)
				});
			}
		})(piece));

		this.squares[piece]=node;
	}

	this.UpdateHtml();
}

PromoteDialog.prototype.UpdateHtml=function() {
	var board_w=this.square_size*this.pieces.length;
	var board_h=this.square_size;

	style(this.node, {
		top: this.pos[Y],
		left: this.pos[X],
		width: board_w,
		height: board_h,
		zIndex: this.z_index,
		borderStyle: "solid",
		borderColour: this.border_colour,
		borderWidth: this.border_width,
		display: this.visible?"block":"none",
		backgroundColor: "#ffffff"
	});

	style(this.board_container, {
		position: "absolute",
		width: board_w,
		height: board_h
	});

	var piece, square;

	for(var i=0; i<this.pieces.length; i++) {
		piece=this.pieces[i];
		square=this.squares[piece];

		style(square, {
			position: "absolute",
			top: 0,
			left: (this.square_size*i),
			width: this.square_size,
			height: this.square_size,
			backgroundImage: "url("+this.img_dir_piece+"/"+this.piece_style+"/"+this.square_size+"/"+Fen.getPieceChar(Util.getPiece(piece, this.colour))+".png)",
			cursor: (this.pointer_cursor?"pointer":"default")
		});
	}
}

PromoteDialog.prototype.SetLocation=function(coords, use_center) {
	var x=coords[X];
	var y=coords[Y];
	var board_w=this.square_size*this.pieces.length;
	var board_h=this.square_size;

	if(use_center) {
		x-=Math.round(board_w/2);
		y-=Math.round(board_h/2);
	}

	x-=this.border_width;

	this.Position([x, y]);
}

PromoteDialog.prototype.Show=function() {
	this.visible=true;
	this.UpdateHtml();
}

PromoteDialog.prototype.Hide=function() {
	this.visible=false;
	this.UpdateHtml();
}
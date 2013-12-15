define(function(require) {
	var Template=require("lib/dom/Template");
	var Event=require("lib/Event");
	var Colour=require("chess/Colour");
	var Util=require("chess/Util");
	var style=require("lib/dom/style");
	var Fen=require("chess/Fen");
	var Piece=require("widgets/piece/Piece");
	var getOffsets=require("lib/dom/getOffsets");
	var html=require("file@./resources/square.html");
	require("css@./resources/square.css");

	function Square(parent, square, size) {
		this._template=new Template(html, parent);
		this._square=square;
		this._size=size||Square.DEFAULT_SIZE;
		this._highlightType=Square.HIGHLIGHT_NONE;

		this.MouseDown=new Event(this);
		this.MouseUp=new Event(this);

		this._setupHtml();
	}

	Square.DEFAULT_SIZE=Piece.DEFAULT_SIZE;

	Square.HIGHLIGHT_NONE="none";
	Square.HIGHLIGHT_POSSIBILITY="possibility";
	Square.HIGHLIGHT_LAST_MOVE_TO="last_move_to";
	Square.HIGHLIGHT_LAST_MOVE_FROM="last_move_from";
	Square.HIGHLIGHT_PREMOVE_TO="premove_to";
	Square.HIGHLIGHT_PREMOVE_FROM="premove_from";
	Square.HIGHLIGHT_CAN_SELECT="can_select";
	Square.HIGHLIGHT_CAN_DROP="can_drop";
	Square.HIGHLIGHT_SELECTED="selected";

	Square.prototype.setHighlight=function(highlightType) {
		var oldClassName="board_square_highlight_"+this._highlightType;
		var newClassName="board_square_highlight_"+highlightType;

		this._template.highlight.classList.remove(oldClassName);
		this._template.highlight.classList.add(newClassName);

		this._highlightType=highlightType;
	}

	Square.prototype.getSquare=function() {
		return this._square;
	}

	Square.prototype.setSize=function(size) {
		this._size=size;
		this._updateSize();
	}

	Square.prototype.setPiece=function(piece) {
		this._piece.setPiece(piece);
	}

	Square.prototype.setPieceStyle=function(pieceStyle) {
		this._piece.setStyle(pieceStyle);
	}

	Square.prototype.setZIndexAbove=function() {
		this._template.root.style.zIndex=2;
	}

	Square.prototype.setZIndexNormal=function() {
		this._template.root.style.zIndex=1;
	}

	Square.prototype.setSquarePosition=function(x, y) {
		style(this._template.root, {
			top: y,
			left: x
		});
	}

	Square.prototype.setPiecePosition=function(x, y) {
		var offsets=getOffsets(this._template.root);

		style(this._template.piece, {
			top: y-offsets[Y],
			left: x-offsets[X]
		});
	}

	Square.prototype.resetPiecePosition=function() {
		style(this._template.piece, {
			top: 0,
			left: 0
		});
	}

	Square.prototype._setupHtml=function() {
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

		this._piece=new Piece(this._template.piece);
		this._piece.setSize(this._size);

		this._updateSize();
	}

	Square.prototype._updateSize=function() {
		var css={
			width: this._size,
			height: this._size
		};

		style(this._template.root, css);
		style(this._template.highlight, css);
		style(this._template.piece, css);

		this._piece.setSize(this._size);
	}

	return Square;
});
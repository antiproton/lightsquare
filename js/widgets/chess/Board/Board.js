define(function(require) {
	var Template = require("lib/dom/Template");
	var create = require("lib/dom/create");
	var style = require("lib/dom/style");
	var getOffsets = require("lib/dom/getOffsets");
	var Event = require("lib/Event");
	var ChessSquare = require("chess/Square");
	var Coords = require("chess/Coords");
	var Square = require("./_Square/Square");
	var Piece = require("chess/Piece");
	var Colour = require("chess/Colour");
	require("css!./board.css");
	var html = require("file!./board.html");
	var PromotionDialog = require("./_PromotionDialog/PromotionDialog");

	function Board(parent) {
		this._template = new Template(html, parent);

		this.Move = new Event();
		this.DragDrop = new Event();
		this.DragPiece = new Event();
		this.PieceDraggedOff = new Event();
		this.SquareClicked = new Event();
		this.SelectPiece = new Event();
		this.PieceSelected = new Event();
		this.Deselected = new Event();

		this._highlightedSquares = {};

		this._move = {
			isDragging: false,
			pieceSelected: false,
			isInProgress: false,
			piece: null,
			from: null,
			mouseOffsets: {
				x: 0,
				y: 0
			}
		};

		this._lastMoveEvent = null;
		this._pendingPromotion = null;
		this._viewingAs = Colour.white;
		this._showSurround = false;
		this._showCoords = true;
		this._coordsPadding = 18;
		this._squareSize = Square.DEFAULT_SIZE;
		this._borderWidth = 1;

		this._htmlUpdatesEnabled = true;
		this._pendingUpdates = [];

		this._setupHtml();
	}

	Board.sizes = Square.sizes;
	Board.squareStyles = Square.styles;
	Board.squareHighlightTypes = Square.highlightTypes;
	Board.DEFAULT_SQUARE_SIZE = Square.DEFAULT_SIZE;
	Board.DEFAULT_SQUARE_STYLE = Square.DEFAULT_STYLE;
	
	Board.prototype.setBoardArray = function(board) {
		ChessSquare.forEach((function(square) {
			this.setPiece(square, board[square.squareNo]);
		}).bind(this));
	}
	
	Board.prototype.getPiece = function(square) {
		return this._squares[square.squareNo].getPiece();
	}

	Board.prototype.setPiece = function(square, piece) {
		if(this._htmlUpdatesEnabled) {
			this._squares[square.squareNo].setPiece(piece);
		}
		
		else {
			this._pendingUpdates.push({
				square: square,
				piece: piece
			});
		}
	}

	Board.prototype.highlightSquares = function(squares, highlightType) {
		if(!(squares instanceof Array)) {
			squares = [squares];
		}

		if(!(highlightType in this._highlightedSquares)) {
			this._highlightedSquares[highlightType] = [];
		}

		this._highlightedSquares[highlightType] = this._highlightedSquares[highlightType].concat(squares);

		for(var i = 0; i < squares.length; i++) {
			this._squares[squares[i].squareNo].setHighlight(highlightType);
		}
	}

	Board.prototype.unhighlightSquares = function() {
		var highlightTypes = Array.prototype.slice.call(arguments);
		
		if(highlightTypes.length === 0) {
			for(var type in Board.squareHighlightTypes) {
				highlightTypes.push(Board.squareHighlightTypes[type]);
			}
		}
		
		var highlightType;
		
		for(var i = 0; i < highlightTypes.length; i++) {
			highlightType = highlightTypes[i];
			
			if(highlightType in this._highlightedSquares) {
				for(var j = 0; j < this._highlightedSquares[highlightType].length; j++) {
					this._squares[this._highlightedSquares[highlightType][j].squareNo].setHighlight(Board.squareHighlightTypes.NONE);
				}
		
				this._highlightedSquares[highlightType] = [];
			}
		}
	}

	Board.prototype.enableHtmlUpdates = function() {
		this._htmlUpdatesEnabled = true;

		while(update = this._pendingUpdates.pop()) {
			this.setPiece(update.square, update.piece);
		}
	}
	
	Board.prototype.disableHtmlUpdates = function() {
		this._htmlUpdatesEnabled = false;
	}
	
	Board.prototype.setAlwaysQueen = function(alwaysQueen) {
		this._alwaysQueen = alwaysQueen;
	}

	Board.prototype.setPieceStyle = function(pieceStyle) {
		this._squares.forEach(function(square) {
			square.setPieceStyle(pieceStyle);
		});
		
		this._promotionDialog.setPieceStyle(pieceStyle);
	}

	Board.prototype.setSquareStyle = function(squareStyle) {
		this._squares.forEach(function(square) {
			square.setSquareStyle(squareStyle);
		});
	}

	Board.prototype.setSquareSize = function(squareSize) {
		this._squareSize = squareSize;
		this._updateHtml();
	}

	Board.prototype.setShowCoords = function(showCoords) {
		this._showCoords = showCoords;
		this._updateHtml();
	}

	Board.prototype.setShowSurround = function(showSurround) {
		this._showSurround = showSurround;
		this._updateHtml();
	}

	Board.prototype.setBorderWidth = function(borderWidth) {
		this._borderWidth = borderWidth;
		this._updateHtml();
	}

	Board.prototype.setViewingAs = function(colour) {
		this._viewingAs = colour;
		this._updateHtml();
	}

	Board.prototype._setupHtml = function() {
		this._setupHtmlCoords();
		this._setupHtmlSquares();
		this._setupPromotionDialog();

		window.addEventListener("mousemove", (function(event) {
			this._boardMouseMove(event);
		}).bind(this));

		this._updateHtml();
	}

	Board.prototype._setupHtmlCoords = function() {
		this._coordContainers = {
			rank: this._template.rank_coords,
			file: this._template.file_coords
		};

		this._coords = {};

		var coord;

		for(var axis in this._coordContainers) {
			this._coords[axis] = [];

			for(var i = 0; i < 8; i++) {
				coord = create("div", this._coordContainers[axis]);
				coord.className = "board_coord board_" + axis;

				this._coords[axis].push(coord);
			}
		}
	}

	Board.prototype._setupHtmlSquares = function() {
		var square;
		
		this._squares = [];

		ChessSquare.forEach((function(chessSquare) {
			square = new Square(this._template.board, chessSquare, this._squareSize);

			square.MouseDown.addHandler(function(event, sender) {
				this._boardMouseDown(event, sender);
			}, this);

			square.MouseUp.addHandler(function(event, sender) {
				this._boardMouseUp(event, sender);
			}, this);

			this._squares[chessSquare.squareNo] = square;
		}).bind(this));
	}
	
	Board.prototype._setupPromotionDialog = function() {
		this._promotionDialogPieceSize = 45;
		this._promotionDialog = new PromotionDialog(this._promotionDialogPieceSize, this._template.promotion_dialog);
		
		this._promotionDialog.PieceSelected.addHandler(function(type) {
			this.Move.fire({
				from: this._pendingPromotion.from,
				to: this._pendingPromotion.to,
				piece: this._pendingPromotion.piece,
				promoteTo: type,
				event: this._pendingPromotion.event
			});
			
			this._pendingPromotion = null;
			this._hidePromotionDialog();
		}, this);
	}

	Board.prototype._updateHtml = function() {
		var boardSize = this._getBoardSize();
		var borderSize = this._borderWidth * 2;
		var paddingIfSurround = (this._showSurround ? this._coordsPadding : 0);
		var paddingIfCoordsOrSurround = (this._showCoords || this._showSurround ? this._coordsPadding : 0);
		var totalSize = paddingIfCoordsOrSurround + boardSize + borderSize + paddingIfSurround;

		this._template.root.classList[
			this._showSurround ? "add" : "remove"
		]("board_with_surround");

		style(this._template.root, {
			width: totalSize,
			height: totalSize
		});

		style(this._template.board_wrapper, {
			top: paddingIfSurround,
			left: paddingIfCoordsOrSurround,
			width: boardSize,
			height: boardSize,
			borderWidth: this._borderWidth
		});

		style(this._template.board, {
			width: boardSize,
			height: boardSize
		});

		this._updateHtmlCoords();
		this._updateHtmlSquares();
	}

	Board.prototype._updateHtmlCoords = function() {
		var fileIndex, rankIndex;
		var boardSize = this._getBoardSize();
		var borderSize = this._borderWidth * 2;
		var paddingIfSurround = (this._showSurround ? this._coordsPadding : 0);

		for(var axis in this._coordContainers) {
			style(this._coordContainers[axis], {
				display: this._showCoords ? "" : "none"
			});
		}

		if(this._showCoords) {
			style(this._coordContainers.file, {
				top: boardSize + borderSize + paddingIfSurround
			});

			for(var i = 0; i < 8; i++) {
				style(this._coords.rank[i], {
					top: this._borderWidth + (this._squareSize * i),
					height: this._squareSize,
					lineHeight: this._squareSize
				});

				style(this._coords.file[i], {
					left: this._borderWidth + (this._squareSize * i),
					width: this._squareSize
				});

				if(this._viewingAs === Colour.white) {
					rankIndex = 7 - i;
					fileIndex = i;
				}

				else {
					rankIndex = i;
					fileIndex = 7 - i;
				}

				this._coords.rank[i].innerHTML = "12345678".charAt(rankIndex);
				this._coords.file[i].innerHTML = "abcdefgh".charAt(fileIndex);
			}
		}
	}

	Board.prototype._updateHtmlSquares = function() {
		this._squares.forEach((function(square) {
			square.setSize(this._squareSize);

			var posX, posY;
			var coords = square.getSquare().coords;

			if(this._viewingAs === Colour.white) {
				posX = this._squareSize * coords.x;
				posY = this._squareSize * (7 - coords.y);
			}

			else {
				posX = this._squareSize * (7 - coords.x);
				posY = this._squareSize * coords.y;
			}

			square.setSquarePosition(posX, posY);
		}).bind(this));
	}
	
	Board.prototype._promptForPromotionPiece = function() {
		this._pendingPromotion = this._lastMoveEvent;
		this._promotionDialog.setColour(this._lastMoveEvent.piece.colour);
		
		var boardOffsets = getOffsets(this._template.board);
		
		var x = this._lastMoveEvent.event.pageX - boardOffsets.x;
		var y = this._lastMoveEvent.event.pageY - boardOffsets.y;
		
		style(this._template.promotion_dialog, {
			display: "block",
			top: y - this._promotionDialogPieceSize,
			left: x
		});
	}
	
	Board.prototype._hidePromotionDialog = function() {
		this._template.promotion_dialog.style.display = "";
	}

	Board.prototype._squareFromMouseEvent = function(event, useMoveOffsets) {
		var x = event.pageX;
		var y = event.pageY;
	
		if(useMoveOffsets && this._move.isDragging) { //get the square that the middle of the piece is over
			x += (Math.round(this._squareSize / 2) - this._move.mouseOffsets.x);
			y += (Math.round(this._squareSize / 2) - this._move.mouseOffsets.y);
		}

		var offsets = getOffsets(this._template.board);

		return this._squareFromOffsets(x - offsets.x, this._getBoardSize() - (y - offsets.y));
	}

	Board.prototype._squareFromOffsets = function(x, y) {
		var square = null;
		
		if(this._isXyOnBoard(x, y)) {
			var boardX = (x - (x % this._squareSize)) / this._squareSize;
			var boardY = (y - (y % this._squareSize)) / this._squareSize;
	
			if(this._viewingAs === Colour.black) {
				boardX = 7 - boardX;
				boardY = 7 - boardY;
			}
			
			square = ChessSquare.fromCoords(new Coords(boardX, boardY));
		}
		
		return square;
	}

	Board.prototype._squareMouseOffsetsFromEvent = function(event) {
		var boardOffsets = getOffsets(this._template.board);

		var mouseOffsets = {
			x: ((event.pageX - boardOffsets.x) % this._squareSize || this._squareSize),
			y: ((event.pageY - boardOffsets.y) % this._squareSize || this._squareSize)
		};

		return mouseOffsets;
	}

	Board.prototype._isXyOnBoard = function(x, y) {
		var boardSize = this._getBoardSize();
		
		return (x > -1 && x < boardSize && y > -1 && y < boardSize);
	}

	Board.prototype._boardMouseDown = function(event, targetSquare) {
		event.preventDefault();

		var piece = targetSquare.getPiece();
		
		if(!this._move.pieceSelected && this._pendingPromotion === null && !this._move.isInProgress && piece !== null) {
			targetSquare.setZIndexAbove();
			
			this._move.pieceSelected = true;
			this._move.from = targetSquare.getSquare();
			this._move.piece = piece;

			var squareOffsets = getOffsets(event.target);
			
			var squareMouseOffsets = {
				x: event.pageX - squareOffsets.x,
				y: event.pageY - squareOffsets.y
			};

			this._move.mouseOffsets = squareMouseOffsets;
		}
	}

	Board.prototype._boardMouseMove = function(event) {
		var args;
		var from = this._move.from;

		if(this._move.pieceSelected && !this._move.isInProgress) {
			args = {
				square: from,
				piece: this.getPiece(from),
				dragging: true,
				cancel: false
			};

			this.SelectPiece.fire(args);

			if(args.cancel) {
				this._resetMove();
				this._squares[from.squareNo].setZIndexNormal();
			}

			else {
				this._move.isDragging = true;
				this._move.isInProgress = true;

				this.PieceSelected.fire({
					square: from,
					isDragging: true
				});
			}
		}

		if(this._move.pieceSelected && this._move.isDragging) {
			args = {
				from: from,
				piece: this._move.piece,
				cancel: false
			};

			this.DragPiece.fire(args);

			if(!args.cancel) {
				this._squares[from.squareNo].setPiecePosition(
					event.pageX - this._move.mouseOffsets.x,
					event.pageY - this._move.mouseOffsets.y
				);
			}
		}
	}

	Board.prototype._boardMouseUp = function(event) {
		event.preventDefault();

		var args;
		var square = this._squareFromMouseEvent(event);

		if(this._move.isInProgress && this._move.isDragging) {
			square = this._squareFromMouseEvent(event, true);
		}

		var fromSquare = null;

		if(this._move.from !== null) {
			fromSquare = this._squares[this._move.from.squareNo];
		}

		args = {
			square: square,
			cancel: false
		};

		if(!this._move.isDragging) {
			this.SquareClicked.fire(args);
		}

		else if(this._move.isInProgress) {
			this.DragDrop.fire(args);
		}

		if(!args.cancel && fromSquare !== null) {
			var from = this._move.from;
			var piece = this.getPiece(this._move.from);
			
			if(this._move.isInProgress) {
				this.Deselected.fire();

				if(square !== null) {
					if(square !== from) {
						this._lastMoveEvent = {
							from: from,
							to: square,
							piece: piece,
							promoteTo: null,
							event: event,
							promptForPromotionPiece: (function() {
								this._promptForPromotionPiece();
							}).bind(this)
						};
						
						this.Move.fire(this._lastMoveEvent);
					}
				}

				else {
					this.PieceDraggedOff.fire({
						from: from,
						piece: piece,
						event: event
					});
				}

				fromSquare.resetPiecePosition();
				
				this._resetMove();
			}

			else if(this._move.pieceSelected && square === from) {
				args = {
					square: square,
					piece: this.getPiece(square),
					dragging: false,
					cancel: false
				};

				this.SelectPiece.fire(args);

				if(!args.cancel) {
					this._move.isInProgress = true;
					this._move.isDragging = false;

					this.PieceSelected.fire({
						square: square,
						isDragging: false
					});
				}

				else {
					this._resetMove();
				}
			}
		}

		else {
			if(fromSquare !== null) {
				fromSquare.resetPiecePosition();
			}

			this._resetMove();
		}

		if(fromSquare !== null) {
			fromSquare.setZIndexNormal();
		}
	}
	
	Board.prototype._resetMove = function() {
		this._move.isDragging = false;
		this._move.from = null;
		this._move.isInProgress = false;
		this._move.piece = null;
		this._move.pieceSelected = false;
	}

	Board.prototype._getBoardSize = function() {
		return this._squareSize * 8;
	}

	return Board;
});
define(function(require) {
	require("lib/Function.implement");
	var Template = require("lib/dom/Template");
	var create = require("lib/dom/create");
	var style = require("lib/dom/style");
	var getOffsets = require("lib/dom/getOffsets");
	var Event = require("lib/Event");
	var ChessBoard = require("chess/Board");
	var MoveAction = require("./_MoveAction");
	var Square = require("./_Square/Square");
	var Chess = require("chess/Chess");
	var Piece = require("chess/Piece");
	require("css!./resources/board.css");
	var html = require("file!./resources/board.html");

	function Board(parent) {
		ChessBoard.call(this);

		this._template = new Template(html, parent);

		this.UserMove = new Event(this);
		this.DragDrop = new Event(this);
		this.DragPiece = new Event(this);
		this.PieceDraggedOff = new Event(this);
		this.SquareClicked = new Event(this);
		this.SelectPiece = new Event(this);
		this.PieceSelected = new Event(this);
		this.Deselected = new Event(this);
		this.MouseOverSquare = new Event(this);
		this.MouseLeavingSquare = new Event(this);
		this.PieceOverSquare = new Event(this);
		this.PieceLeavingSquare = new Event(this);

		this._highlightedSquares = {};

		this._moveAction = new MoveAction();
		this._squareMouseCurrentlyOver = null;
		this._squareCurrentlyDraggingPieceOver = null;

		this._viewingAs = Piece.WHITE;
		this._showSurround = false;
		this._showCoords = true;
		this._coordsPadding = 18;
		this._squareSize = Square.DEFAULT_SIZE;
		this._borderWidth = 1;

		this._htmlUpdatesEnabled = true;

		this._setupHtml();
	}

	Board.implement(ChessBoard);

	Board.squareStyles = Square.styles;
	Board.squareHighlightTypes = Square.highlightTypes;

	Board.prototype.setSquare = function(square, piece) {
		ChessBoard.prototype.setSquare.call(this, square, piece);

		if(this._htmlUpdatesEnabled) {
			this._setHtmlSquare(square, piece);
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
			this._uiSquares[squares[i]].setHighlight(highlightType);
		}
	}

	Board.prototype.unhighlightSquares = function(highlightType) {
		for(var i = 0; i < this._highlightedSquares[highlightType].length; i++) {
			this._uiSquares[this._highlightedSquares[highlightType][i]].setHighlight(Square.HIGHLIGHT_NONE);
		}

		this._highlightedSquares[highlightType] = [];
	}

	Board.prototype.getBoardSize = function() {
		return this._squareSize * 8;
	}

	Board.prototype.mouseIsOnBoard = function(event, useOffsets, offsets) {
		offsets = offsets || this._moveAction.mouseOffsets;

		var x = event.pageX;
		var y = event.pageY;

		if(useOffsets) {
			x += (Math.round(this._squareSize/2) - offsets.x);
			y += (Math.round(this._squareSize/2) - offsets.y);
		}

		var boardOffsets = getOffsets(this._template.board);

		x -= boardOffsets.x;
		y -= boardOffsets.y;

		y = this.getBoardSize() - y;

		return this._isXyOnBoard(x, y);
	}

	Board.prototype.setHtmlUpdatesEnabled = function(enabled) {
		this._htmlUpdatesEnabled = enabled;

		if(enabled) {
			this._updateSquares();
		}
	}

	Board.prototype.setPieceStyle = function(pieceStyle) {
		for(var square = 0; square < 64; square++) {
			this._uiSquares[square].setPieceStyle(pieceStyle);
		}
	}

	Board.prototype.setSquareStyle = function(squareStyle) {
		for(var square = 0; square < 64; square++) {
			this._uiSquares[square].setSquareStyle(squareStyle);
		}
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
		var self = this;

		this._setupHtmlCoords();
		this._setupHtmlSquares();

		window.addEventListener("mousemove", function(e) {
			self._boardMouseMove(e);
		});

		this._template.board.addEventListener("mouseout", function(e) {
			self._updateMouseOverInfo(e);
		});

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
		this._uiSquares = [];

		var uiSquare;

		for(var i = 0; i < 64; i++) {
			uiSquare = new Square(
				this._template.board,
				i,
				this._squareSize
			);

			uiSquare.MouseDown.addHandler(this, function(data, sender) {
				this._boardMouseDown(data.event, sender);
			});

			uiSquare.MouseUp.addHandler(this, function(data, sender) {
				this._boardMouseUp(data.event, sender);
			});

			this._uiSquares.push(uiSquare);
		}
	}

	Board.prototype._updateHtml = function() {
		var boardSize = this.getBoardSize();
		var borderSize = this._borderWidth*2;
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
		var boardSize = this.getBoardSize();
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

				if(this._viewingAs === Piece.WHITE) {
					rankIndex = 7 - i;
					fileIndex = i;
				}

				else {
					rankIndex = i;
					fileIndex = 7 - i;
				}

				this._coords.rank[i].innerHTML = Chess.RANKS.charAt(rankIndex);
				this._coords.file[i].innerHTML = Chess.FILES.charAt(fileIndex);
			}
		}
	}

	Board.prototype._updateHtmlSquares = function() {
		var uiSquare;

		for(var square = 0; square < 64; square++) {
			uiSquare = this._uiSquares[square];

			uiSquare.setSize(this._squareSize);

			var posX, posY;
			var boardX = Chess.xFromSquare(square);
			var boardY = Chess.yFromSquare(square);

			if(this._viewingAs === Piece.WHITE) {
				posX = this._squareSize * boardX;
				posY = this._squareSize * (7 - boardY);
			}

			else {
				posX = this._squareSize * (7 - boardX);
				posY = this._squareSize * boardY;
			}

			uiSquare.setSquarePosition(posX, posY);
		}
	}

	Board.prototype._setHtmlSquare = function(square, piece) {
		this._uiSquares[square].setPiece(piece);
	}

	Board.prototype._updateSquares = function() {
		for(var square = 0; square < 64; square++) {
			this._setHtmlSquare(square, this._board[square]);
		}
	}

	Board.prototype._squareFromMouseEvent = function(event, useMoveActionOffsets) {
		var x = event.pageX;
		var y = event.pageY;

		if(useMoveActionOffsets) { //get the square that the middle of the piece is over
			x += (Math.round(this._squareSize / 2) - this._moveAction.mouseOffsets.x);
			y += (Math.round(this._squareSize / 2) - this._moveAction.mouseOffsets.y);
		}

		var offsets = getOffsets(this._template.board);

		return this._squareFromOffsets(x - offsets.x, this.getBoardSize() - (y - offsets.y));
	}

	Board.prototype._squareFromOffsets = function(x, y) {
		var boardX = (x - (x % this._squareSize)) / this._squareSize;
		var boardY = (y - (y % this._squareSize)) / this._squareSize;

		if(this._viewingAs === Piece.BLACK) {
			boardX = 7 - boardX;
			boardY = 7 - boardY;
		}

		return Chess.squareFromCoords({
			x: boardX,
			y: boardY
		});
	}

	Board.prototype._squareMouseOffsetsFromEvent = function(event) {
		var boardOffsets = getOffsets(this._template.board);

		var mouseOffsets = {
			x: ((event.pageX - boardOffsets.x) % this._squareSize || this._squareSize),
			y: ((event.pageY - boardOffsets.y) % this._squareSize || this._squareSize)
		};

		return mouseOffsets;
	}

	Board.prototype._boardMouseDown = function(event, targetUiSquare) {
		event.preventDefault();

		if(this.mouseIsOnBoard(event)) {
			var square = targetUiSquare.getSquare();

			if(!this._moveAction.selected && !this._moveAction.isInProgress && this._board[square] !== Piece.NONE) {
				targetUiSquare.setZIndexAbove();
				
				this._moveAction.selected = true;
				this._moveAction.from = square;
				this._moveAction.piece = this._board[square];

				var squareOffsets = getOffsets(event.target);
				
				var squareMouseOffsets = {
					x: event.pageX - squareOffsets.x,
					y: event.pageY - squareOffsets.y
				};

				this._moveAction.mouseOffsets = squareMouseOffsets;
			}
		}
	}

	Board.prototype._boardMouseMove = function(event) {
		event.preventDefault();

		var square = this._squareFromMouseEvent(event);

		//update mouseover sq and fire events

		this._updateMouseOverInfo(event);
		this._updatePieceDragInfo(event);

		var args;

		if(this._moveAction.selected && !this._moveAction.isInProgress) { //down and not already up on same square
			args = {
				square: square,
				piece: this._board[square],
				dragging: true,
				cancel: false
			};

			this.SelectPiece.fire(args);

			if(args.cancel) {
				this._moveAction.reset();
				this._uiSquares[square].setZIndexNormal();
			}

			else {
				this._moveAction.mode = MoveAction.DRAG;
				this._moveAction.isInProgress = true;

				this.PieceSelected.fire({
					square: square
				});
			}
		}

		if(this._moveAction.selected && this._moveAction.mode === MoveAction.DRAG) {
			args = {
				square: square,
				piece: this._moveAction.piece,
				cancel: false
			};

			this.DragPiece.fire(args);

			if(!args.cancel) {
				this._uiSquares[this._moveAction.from].setPiecePosition(
					event.pageX - this._moveAction.mouseOffsets.x,
					event.pageY - this._moveAction.mouseOffsets.y
				);
			}
		}
	}

	Board.prototype._boardMouseUp = function(event) {
		event.preventDefault();

		var args;
		var square = this._squareFromMouseEvent(event);

		if(this._moveAction.isInProgress && this._moveAction.mode === MoveAction.DRAG) {
			square = this._squareFromMouseEvent(event, true);
		}

		var fromUiSquare = null;

		if(this._moveAction.from !== null) {
			fromUiSquare = this._uiSquares[this._moveAction.from];
		}

		args = {
			square: square,
			cancel: false
		};

		if(this._moveAction.mode === MoveAction.CLICK) {
			this.SquareClicked.fire(args);
		}

		else if(this._moveAction.mode === MoveAction.DRAG && this._moveAction.isInProgress) {
			this.DragDrop.fire(args);
		}

		if(!args.cancel) {
			if(this._moveAction.isInProgress) {
				//either dragged and dropped, or clicking on second square to complete click-click move

				this.Deselected.fire();

				if(this.mouseIsOnBoard(event, true)) {
					if(square !== this._moveAction.from) {
						this.UserMove.fire({
							from: this._moveAction.from,
							to: square,
							piece: this.getSquare(this._moveAction.from),
							event: event
						});
					}
				}

				else {
					this.PieceDraggedOff.fire({
						from: this._moveAction.from
					});
				}

				fromUiSquare.resetPiecePosition();
				this._moveAction.reset();
			}

			else if(this._moveAction.selected && square === this._moveAction.from && !this._moveAction.isInProgress) {
				//clicking on first square to select a piece

				args = {
					square: square,
					piece: this._board[square],
					dragging: false,
					cancel: false
				};

				this.SelectPiece.fire(args);

				if(!args.cancel) {
					this._moveAction.isInProgress = true;
					this._moveAction.mode = MoveAction.CLICK;

					this.PieceSelected.fire({
						square: square
					});
				}

				else {
					this._moveAction.reset();
				}
			}
		}

		else {
			if(fromUiSquare !== null) {
				fromUiSquare.resetPiecePosition();
			}

			this._moveAction.reset();
		}

		if(fromUiSquare !== null) {
			fromUiSquare.setZIndexNormal();
		}

		this._updatePieceDragInfo(event);
	}

	Board.prototype._isXyOnBoard = function(x, y) {
		var boardSize = this.getBoardSize();

		return !(x < 0 || x > boardSize || y < 0 || y > boardSize);
	}

	Board.prototype._updateMouseOverInfo = function(event) {
		var square = this._squareFromMouseEvent(event);

		if(this.mouseIsOnBoard(event) && square > -1 && square < 64) {
			if(this._squareMouseCurrentlyOver !== square) {
				if(this._squareMouseCurrentlyOver !== null) {
					this.MouseLeavingSquare.fire({
						square: this._squareMouseCurrentlyOver
					});
				}

				this._squareMouseCurrentlyOver = square;

				this.MouseOverSquare.fire({
					square: square
				});
			}
		}

		else {
			if(this._squareMouseCurrentlyOver !== null) {
				this.MouseLeavingSquare.fire({
					square: this._squareMouseCurrentlyOver
				});
			}

			this._squareMouseCurrentlyOver = null;
		}
	}

	Board.prototype._updatePieceDragInfo = function(event) {
		var square = this._squareFromMouseEvent(event, true);

		if(this._moveAction.isInProgress && this._moveAction.mode === MoveAction.DRAG) {
			if(this.mouseIsOnBoard(event)) {
				if(this._squareCurrentlyDraggingPieceOver !== square) {
					if(this._squareCurrentlyDraggingPieceOver !== null) {
						this.PieceLeavingSquare.fire({
							square: this._squareCurrentlyDraggingPieceOver
						});
					}

					this._squareCurrentlyDraggingPieceOver = square;

					this.PieceOverSquare.fire({
						square: square
					});
				}
			}

			else {
				if(this._squareCurrentlyDraggingPieceOver !== null) {
					this.PieceLeavingSquare.fire({
						square: this._squareCurrentlyDraggingPieceOver
					});
				}

				this._squareCurrentlyDraggingPieceOver = null;
			}
		}

		else {
			if(this._squareCurrentlyDraggingPieceOver !== null) {
				this.PieceLeavingSquare.fire({
					square: this._squareCurrentlyDraggingPieceOver
				});
			}

			this._squareCurrentlyDraggingPieceOver = null;
		}
	}

	return Board;
});
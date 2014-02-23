define(function(require) {
	var Chess = require("chess/Chess");
	var Piece = require("chess/Piece");

	function Board() {
		this._board = [];

		for(var i = 0; i < 64; i++) {
			this._board.push(Piece.NONE);
		}

		this._kingPositions = []
		this._kingPositions[Piece.WHITE] = null;
		this._kingPositions[Piece.BLACK] = null;
	}

	Board.prototype.move = function(from, to) {
		this.setSquare(to, this.getSquare(from));
		this.setSquare(from, Piece.NONE);
	}

	Board.prototype.setSquare = function(square, piece) {
		this._board[square] = piece;

		if(Piece.getType(piece) === Piece.KING) {
			this._kingPositions[Piece.getColour(piece)] = square;
		}
	}

	Board.prototype.getSquare = function(square) {
		return this._board[square];
	}
	
	Board.prototype.getKingPosition = function(colour) {
		return this._kingPositions[colour];
	}

	Board.prototype.setBoardArray = function(board) {
		for(var square = 0; square < 64; square++) {
			this.setSquare(square, board[square]);
		}
	}

	Board.prototype.getBoardArray = function() {
		return this._board;
	}

	Board.prototype.getCopy = function(board) {
		var board = new Board();

		board.setBoardArray(this.getBoardArray());

		return board;
	}

	return Board;
});
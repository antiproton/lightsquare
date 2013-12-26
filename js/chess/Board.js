define(function(require) {
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");

	function Board() {
		this._board=[];

		for(var i=0; i<64; i++) {
			this._board.push(Piece.NONE);
		}

		this.kingPositions=[]
		this.kingPositions[Piece.WHITE]=null;
		this.kingPositions[Piece.BLACK]=null;
	}

	Board.prototype.move=function(from, to) {
		this.setSquare(to, this.getSquare(from));
		this.setSquare(from, Piece.NONE);
	}

	Board.prototype.setSquare=function(square, piece) {
		this._board[square]=piece;

		if(Piece.getType(piece)===Piece.KING) {
			this.kingPositions[Piece.getColour(piece)]=square;
		}
	}

	Board.prototype.getSquare=function(square) {
		return this._board[square];
	}

	Board.prototype.setBoardArray=function(board) {
		for(var square=0; square<64; square++) {
			this.setSquare(square, board[square]);
		}
	}

	Board.prototype.getBoardArray=function() {
		return this._board;
	}

	Board.prototype.copy=function(board) {
		var board=new this.constructor();

		board.setBoardArray(this.getBoardArray());
	}

	return Board;
});
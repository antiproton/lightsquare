define(function(require) {
	var CastlingRights=require("chess/CastlingRights");
	var Chess=require("chess/Chess");
	var MoveLabel=require("chess/MoveLabel");

	function Class(from, to) {
		this.isValid=false;
		this.side;
		this.rookStartPos;
		this.rookEndPos;
		this.sign;

		var kingEndSquares=[];

		kingEndSquares[CastlingRights.KINGSIDE]=from+2;
		kingEndSquares[CastlingRights.QUEENSIDE]=from-2;

		var side=kingEndSquares.indexOf(to);
		var kingEndSquare;
		var rookPos;

		if(side!==-1 && (from===Chess.KING_HOME_SQUARE_WHITE || from===Chess.KING_HOME_SQUARE_BLACK)) {
			kingEndSquare=kingEndSquares[side];

			rookPos=[];

			rookPos[CastlingRights.KINGSIDE]={
				start: kingEndSquare+1,
				end: kingEndSquare-1
			};

			rookPos[CastlingRights.QUEENSIDE]={
				start: kingEndSquare-2,
				end: kingEndSquare+1
			};

			this.isValid=true;
			this.side=side;
			this.rookStartPos=rookPos[side].start;
			this.rookEndPos=rookPos[side].end;
			this.sign=Class.signs[side];
		}
	}

	Class.signs=[];
	Class.signs[CastlingRights.KINGSIDE]=MoveLabel.SIGN_CASTLE_KS;
	Class.signs[CastlingRights.QUEENSIDE]=MoveLabel.SIGN_CASTLE_QS;

	return Class;
});
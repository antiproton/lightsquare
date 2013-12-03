function CastlingDetails(from, to) {
	this.isValid=false;
	this.side;
	this.rookStartPos;
	this.rookEndPos;
	this.sign;
	
	var kingEndSquares=[];

	kingEndSquares[KINGSIDE]=from+2;
	kingEndSquares[QUEENSIDE]=from-2;

	var side=kingEndSquares.indexOf(to);
	var kingEndSquare;
	var rookPos;

	if(side!==-1 && (from===KING_HOME_SQUARE_WHITE || from===KING_HOME_SQUARE_BLACK)) {
		kingEndSquare=kingEndSquares[side];

		rookPos=[];

		rookPos[KINGSIDE]={
			start: kingEndSquare+1,
			end: kingEndSquare-1
		};

		rookPos[QUEENSIDE]={
			start: kingEndSquare-2,
			end: kingEndSquare+1
		};

		this.isValid=true;
		this.side=side;
		this.rookStartPos=rookPos[side].start;
		this.rookEndPos=rookPos[side].end;
		this.sign=CastlingDetails.signs[side];
	}
}

CastlingDetails.signs=[];
CastlingDetails.signs[KINGSIDE]=SIGN_CASTLE_KS;
CastlingDetails.signs[QUEENSIDE]=SIGN_CASTLE_QS;
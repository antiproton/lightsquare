/*
some stuff to do on games that have a visible board (square highlighting etc)
*/

function IGameWithUiBoard() {

	//this.Board.SqMouseOver.AddHandler(this, function(data) {
	//	var sq=data.Sq;
	//	var pc=this.Board.GetSquare(sq);
	//
	//	if(pc!==SQ_EMPTY) {
	//		if(this.CanSelectPiece(sq)) {
	//			//this.Board.HiliteCanSelect(sq);
	//		}
	//	}
	//});
	//
	//this.Board.SqMouseOut.AddHandler(this, function(data) {
	//	var sq=data.Sq;
	//	var pc=this.Board.GetSquare(sq);
	//
	//	if(pc!==SQ_EMPTY) {
	//		if(this.CanSelectPiece(sq)) {
	//			//this.Board.UnhiliteCanSelect();
	//		}
	//	}
	//});

	//this had last move highlighter as well but that is only needed in livegames really


}

IGameWithUiBoard.prototype.CanSelectPiece=function(sq) {
	var pc=this.Board.GetSquare(sq);
	var colour=Util.colour(pc);

	if(this.UserControl===IGameCommon.USER_CONTROL_NONE || this.Position.Active!==colour) {
		return false;
	}

	if(this.UserControl===IGameCommon.USER_CONTROL_PLAYER && colour!==this.UserColour) {
		return false;
	}

	var legal_moves=0;
	var available;

	if(pc!==SQ_EMPTY) {
		available=Util.moves_available(Util.type(pc), sq, colour);

		for(var n=0; n<available.length; n++) {
			if(this.Move(sq, available[n], QUEEN, true).Legal) {
				legal_moves++;
			}
		}
	}

	if(legal_moves===0) {
		return false;
	}

	return true;
}
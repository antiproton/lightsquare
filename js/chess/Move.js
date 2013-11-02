/*
.Action - array of objects like {
	Sq: 63,
	Pc: SQ_EMPTY
}

Action and Label have to be initialised manually by calling code
*/

/*
general pointers

PreviousMove - null if first move
PreviousVariation - null if no variations precede it
NextMove - null if last move
NextVariation - null if no variations
NextItem - next move or variation (null if last move)
PreviousItem - previous move or variation (null if first move)

move-specific pointers

Variation - which line the move is part of
*/

function Move() {
	this.EngineBestMove=null; //best reply to this move e.g. "e8=Q#"
	this.EngineScore=null; //eval result at this move e.g. 1.96
	this.EngineScoreType=null; //cp or mate.  determines what EngineScore means (mate in n or centi-pawn score of n)
	this.Castling=false;
	this.IsVariation=false; //for distinguishing between moves and variations in a move list
	this.Valid=false;
	this.Legal=false;
	this.Success=false; //whether the move has been applied successfully (this can be false for perfectly legal moves)
	this.Capture=null;
	this.PromoteTo=null;
	this.Mtime=null;
	this.Fen=null;
	this.Action=[];
	this.Fs=null; //the original move squares for last move highlighting etc, if any
	this.Ts=null;
	this.Piece=null; //bughouse drops

	this.ResetPointers();

	this.Label={
		Piece: "",
		Disambiguation: "",
		Sign: "",
		To: "",
		Special: "",
		Check: "",
		Notes: "" //!? etc
	};
}

Move.prototype.ResetPointers=function() {
	//general

	this.Variation=null;
	this.PreviousMove=null;
	this.PreviousVariation=null;
	this.NextMove=null;
	this.NextVariation=null;
	this.PreviousItem=null;
	this.NextItem=null;
	this.ItemIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 3 (variations are counted).  Nc3 is 1.

	//move-specific

	this.Colour=null;
	this.Dot=".";
	this.DisplayFullmove=false;
	this.Halfmove=null; //e4 e5 (h5 Nc3) d4 //Nc3 is 2 (based on whole line starting from e4)
	this.Fullmove=null;
	this.MoveIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 2 (variations are ignored).  Nc3 is 1 (based on variation line)
}

Move.prototype.GetLabel=function() {
	return this.Label.Piece+this.Label.Disambiguation+this.Label.Sign+this.Label.To+this.Label.Special+this.Label.Check+this.Label.Notes;
}

Move.prototype.GetFullLabel=function() {
	return this.Fullmove+this.Dot+" "+this.GetLabel();
}

Move.prototype.PointersUpdated=function() {
	/*
	nothing here (UiMove needs it for putting the fullmove number on black moves that
	have just had a variation inserted directly before them)
	*/
}
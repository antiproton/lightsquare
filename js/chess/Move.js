function Move() {
	HistoryItem.implement(this);

	this.EngineBestMove=null; //best reply to this move e.g. "e8=Q#"
	this.EngineScore=null; //eval result at this move e.g. 1.96 or number of moves to mate
	this.EngineScoreType=null; //"cp" or "mate".  says what EngineScore means

	this.Valid=false;
	this.Legal=false;
	this.Success=false; //whether the move has been applied successfully (this can be false for legal moves)
	this.Mtime=null;

	this.Castling=false;
	this.Capture=null;
	this.PromoteTo=null;
	this.Fen=null;
	this.Action=[];
	this.Fs=null; //the original move squares for last move highlighting etc, if any
	this.Ts=null;
	this.Piece=null; //for bughouse moves

	this.IsVariation=false; //for distinguishing between moves and variations in a move list

	this.Label={
		Piece: "",
		Disambiguation: "",
		Sign: "",
		To: "",
		Special: "",
		Check: "",
		Notes: "" //!? etc
	};

	this.IsSelected=false;

	this.Dot=new Property(this, function() {
		return Util.fullmove_dot(this.Colour.Get());
	});

	this.DisplayFullmove=new Property(this, function() {
		return (this.Colour.Get()===WHITE || this.MoveIndex===0 || this.PreviousVariation!==null);
	});

	this.Colour=new Property(this, function() {
		return Util.hm_colour(this.halfmove);
	});

	this.Fullmove=new Property(this, function() { //e4 e5 Nc3 //e4 and e5 are 1, Nc3 is 2
		return Util.fullmove(this.halfmove);
	});
}

Move.prototype.ResetPointers=function() {
	HistoryItem.prototype.ResetPointers.call(this);

	this.Halfmove=null; //e4 e5 (h5 Nc3) d4 //Nc3 is 2 (based on whole line starting from e4)
	this.MoveIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 2 (variations are ignored).  Nc3 is 1 (based on variation line)
}

Move.prototype.SetColour=function(colour) {
	this.Colour=colour;
}

Move.prototype.SetHalfmove=function(halfmove) {
	this.Halfmove=halfmove;
}

Move.prototype.SetFullmove=function(fullmove) {
	this.Fullmove=fullmove;
}

Move.prototype.SetMoveIndex=function(index) {
	this.MoveIndex=index;
}

Move.prototype.GetLabel=function() {
	return this.Label.Piece+this.Label.Disambiguation+this.Label.Sign+this.Label.To+this.Label.Special+this.Label.Check+this.Label.Notes;
}

Move.prototype.GetFullLabel=function() {
	return this.Fullmove+this.Dot.Get()+" "+this.GetLabel();
}

Move.prototype.Select=function() {
	this.IsSelected=true;
}

Move.prototype.Deselect=function() {
	this.IsSelected=false;
}
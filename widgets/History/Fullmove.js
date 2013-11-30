function Fullmove(parent, fullmove) {
	this.tpl=new Template("fullmove", parent);
	this.setup_template();

	this.Fullmove=fullmove;

	this.is_move_added=[];
	this.is_move_added[WHITE]=false;
	this.is_move_added[BLACK]=false;

	this.IsMoveAdded=new Property(this, function(colour) {
		return this.is_move_added[colour];
	});
}

Fullmove.prototype.setup_template=function() {
	this.colour_cols=[];
	this.colour_cols[WHITE]=this.tpl.white_col;
	this.colour_cols[BLACK]=this.tpl.black_col;
}

Fullmove.prototype.Add=function(move) {
	this.colour_cols[move.Colour].appendChild(move.Node);
	move.ParentFullmove=this;
	this.is_move_added[move.Colour]=true;
}

Fullmove.prototype.Remove=function(move) {
	$(move.Node).remove();
	this.is_move_added[move.Colour]=false;
}

Fullmove.prototype.IsEmpty=function() {
	return (!this.is_move_added[WHITE] && !this.is_move_added[BLACK]);
}
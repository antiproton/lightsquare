function MoveLabel() {
	this.piece="";
	this.disambiguation="";
	this.sign="";
	this.special="";
	this.check="";
	this.notes="";
}

MoveLabel.prototype.toString=function() {
	return this.piece+this.disambiguation+this.sign+this.to+this.special+this.check+this.notes;
}
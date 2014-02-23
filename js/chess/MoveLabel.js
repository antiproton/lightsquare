define(function(require) {
	function MoveLabel() {
		this.piece = "";
		this.disambiguation = "";
		this.sign = "";
		this.to = "";
		this.special = "";
		this.check = "";
		this.notes = "";
	}

	MoveLabel.prototype.toString = function() {
		return this.piece + this.disambiguation + this.sign + this.to + this.special + this.check + this.notes;
	}

	MoveLabel.SIGN_CASTLE_KS = "O-O";
	MoveLabel.SIGN_CASTLE_QS = "O-O-O";
	MoveLabel.SIGN_CAPTURE = "x";
	MoveLabel.SIGN_CHECK = "+";
	MoveLabel.SIGN_MATE = "#";
	MoveLabel.SIGN_PROMOTE = "=";
	MoveLabel.SIGN_BUGHOUSE_DROP = "@";

	return MoveLabel;
});
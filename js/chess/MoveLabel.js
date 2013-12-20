define(function(require) {
	function Class() {
		this.piece="";
		this.disambiguation="";
		this.sign="";
		this.to="";
		this.special="";
		this.check="";
		this.notes="";
	}

	Class.prototype.toString=function() {
		return this.piece+this.disambiguation+this.sign+this.to+this.special+this.check+this.notes;
	}

	Class.SIGN_CASTLE_KS="O-O";
	Class.SIGN_CASTLE_QS="O-O-O";
	Class.SIGN_CAPTURE="x";
	Class.SIGN_CHECK="+";
	Class.SIGN_MATE="#";
	Class.SIGN_PROMOTE="=";
	Class.SIGN_BUGHOUSE_DROP="@";

	return Class;
});
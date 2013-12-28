define(function(require) {
	var Template=require("lib/dom/Template");
	var Base=require("../../_Move");
	var html=require("file@./resources/move.html");

	function Move(move) {
		Base.call(this, move);

		this._parentFullmove=null;
		this._template=new Template(html);
		this.node=this._template.root;
	}

	Move.implement(Base);

	Move.prototype.isFullmoveDisplayed=function() {
		return false;
	}

	Move.prototype.setParentFullmove=function(fullmove) {
		this._parentFullmove=fullmove;
	}

	Move.prototype.getParentFullmove=function() {
		return this._parentFullmove;
	}

	return Move;
});
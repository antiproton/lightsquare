define(function(require) {
	var Base=require("../../_Move");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/move.html");

	function Move() {
		Base.call(this);

		this._template=new Template(html);
		this.node=this._template.root;
	}

	Move.implement(Base);

	Move.prototype.setPreviousVariation=function(variation) {
		Move.prototype.setPreviousVariation.call(this, variation);

		this._updateFullmove();
	}

	Move.prototype.setHalfmove=function(halfmove) {
		this._halfmove=halfmove;
		this._updateFullmove();
	}

	Move.prototype._updateFullmove=function() {
		this._template.fullmove.style.visibility=(this.isFullmoveDisplayed()?"":"hidden");
		this._template.fullmove.innerHTML=this.getFullmove()+this.getDot();
	}

	return Move;
});
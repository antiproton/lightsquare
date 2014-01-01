define(function(require) {
	require("lib/Function.implement");
	var Base=require("chess/history/Move");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/move.html");

	function Move(move) {
		Base.call(this, move);

		this._template=new Template(html);
		this.node=this._template.root;
	}

	Move.implement(Base);

	Move.prototype.setPreviousVariation=function(variation) {
		Move.prototype.setPreviousVariation.call(this, variation);

		this._updateFullmove();
	}

	Move.prototype._updateFullmove=function() {

		/*
		return (
				this.getColour()===WHITE
				|| this===this._variation.getFirstMove()
				|| this.getPreviousVariation()!==null
			);
		*/
		this._template.fullmove.style.visibility=(this.isFullmoveDisplayed()?"":"hidden");
		this._template.fullmove.innerHTML=this.getFullmove()+this.getDot();
	}

	return Move;
});
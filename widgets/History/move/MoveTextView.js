define(function(require) {
	var UiMove=require("./UiMove");
	var Template=require("js/dom/Template");

	function MoveTextView() {
		UiMove.call(this);

		this._template=new Template("move_textview");
		this.node=this._template.root;
	}

	MoveTextView.implement(UiMove);

	MoveTextView.prototype.setPreviousVariation=function(variation) {
		UiMove.prototype.setPreviousVariation.call(this, variation);

		this._updateFullmove();
	}

	MoveTextView.prototype.setHalfmove=function(halfmove) {
		this._halfmove=halfmove;
		this._updateFullmove();
	}

	MoveTextView.prototype._updateFullmove=function() {
		this._template.fullmove.style.visibility=(this.isFullmoveDisplayed()?"":"hidden");
		this._template.fullmove.innerHTML=this.fullmove+this.dot.Get();
	}

	return MoveTextView;
});
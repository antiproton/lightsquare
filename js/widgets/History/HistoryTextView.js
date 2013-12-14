define(function(require) {
	var History=require("./_History");
	var VariationTextView=require("./variation/_VariationTextView");
	var MoveTextView=require("./move/_MoveTextView");
	var Template=require("lib/dom/Template");

	function HistoryTextView(parent) {
		History.call(this);

		this._tpl=new Template("history_textview", parent);
		this._tpl.root.appendChild(this.mainLine.node);
	}

	HistoryTextView.implement(History);

	HistoryTextView.prototype.createMove=function() {
		var move=new MoveTextView();

		this._setupMove(move);

		return move;
	}

	HistoryTextView.prototype.createVariation=function() {
		return new VariationTextView();
	}

	return HistoryTextView;
});
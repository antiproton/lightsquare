define(function(require) {
	var BaseHistory=require("../_History");
	var Variation=require("./variation/_Variation");
	var Move=require("./move/_Move");
	var Template=require("lib/dom/Template");

	function History(parent) {
		BaseHistory.call(this);

		this._tpl=new Template("history_textview", parent);
		this._tpl.root.appendChild(this.mainLine.node);
	}

	History.implement(BaseHistory);

	History.prototype.createMove=function() {
		var move=new Move();

		this._setupMove(move);

		return move;
	}

	History.prototype.createVariation=function() {
		return new Variation();
	}

	return History;
});
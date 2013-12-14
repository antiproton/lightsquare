define(function(require) {
	var History=require("./_History");
	var VariationColView=require("./variation/_VariationColView");
	var MoveColView=require("./move/_MoveColView");
	var Template=require("lib/dom/Template");

	function HistoryColView(parent) {
		History.call(this);

		this._template=new Template("history_colview", parent);
		this._template.root.appendChild(this.mainLine.node);
	}

	HistoryColView.implement(History);

	HistoryColView.prototype.move=function(move) {
		this.mainLine.add(move);

		this.Moved.fire({
			move: move
		});

		this.select(move);

		return true;
	}

	HistoryColView.prototype.createVariation=function() {
		return new VariationColView();
	}

	HistoryColView.prototype.createMove=function() {
		var move=new MoveColView();

		this._setupMove(move);

		return move;
	}

	return HistoryColView;
});
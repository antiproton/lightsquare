define(function(require, exports, module) {
	var List=require("lib/List");
	var Template=require("lib/dom/Template");
	var Fullmove=require("./_Fullmove/Fullmove");
	var html=require("file@./resources/movelist.html");

	function MoveList() {
		List.call(this);

		this._template=new Template(html);
		this._fullmoves=new List();
		this.node=this._template.root;
	}

	MoveList.implement(List);

	MoveList.prototype.setStartingFullmove=function(fullmove) {
		this._startingFullmove=fullmove;
		this._updateFullmoves();
	}

	MoveList.prototype.insert=function(move) {
		this.add(move);
	}

	MoveList.prototype.add=function(move) {
		List.prototype.add.call(this, move);

		var lastFullmove=this._fullmoves.lastItem();

		if(lastFullmove===null || move.getColour()===WHITE) {
			lastFullmove=this._fullmoves.add(new Fullmove(this._template.root, move.getFullmove()));
		}

		lastFullmove.add(move);
	}

	MoveList.prototype.remove=function(move) {
		List.prototype.remove.call(this, move);

		var fullmove=move.getParentFullmove();

		fullmove.remove(move);

		if(fullmove.isEmpty()) {
			this._fullmoves.remove(fullmove);
			this._template.root.removeChild(fullmove.node);
		}
	}

	return MoveList;
});
define(function(require) {
	var List=require("lib/List");
	var Move=require("./_Move/Move");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/history.html");
	var Event=require("lib/Event");
	require("css@./resources/history.css");

	function History(parent) {
		this.UserSelect=new Event(this);
		this._template=new Template(html, parent);
		this._fullmoves=new List();
	}

	History.prototype.move=function(move) {
		var historyMove=new Move(move);

		this._addMove(historyMove);

		historyMove.UserSelect.addHandler(this, function() {
			this.select(historyMove);
		});

		this.select(historyMove);
	}

	History.prototype.clear=function() {

	}

	History.prototype._addMove=function(move) {
		var lastFullmove=this._fullmoves.lastItem();

		if(lastFullmove===null || move.getColour()===WHITE) {
			lastFullmove=this._fullmoves.add(new Fullmove(this._template.root, move.getFullmove()));
		}

		lastFullmove.add(move);
	}

	History.prototype.undo=function() {
		var move=this.getLastMove();
		var fullmove=move.getParentFullmove();

		fullmove.remove(move);

		if(fullmove.isEmpty()) {
			this._fullmoves.remove(fullmove);
			this._template.root.removeChild(fullmove.node);
		}
	}

	return History;
});
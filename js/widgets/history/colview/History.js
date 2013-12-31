define(function(require) {
	var List=require("lib/List");
	var Event=require("lib/Event");
	var Move=require("./_Move/Move");
	var Fullmove=require("./_Fullmove/Fullmove");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/history.html");
	require("css@./resources/history.css");

	function History(parent) {
		this.UserSelect=new Event(this);
		this._template=new Template(html, parent);
		this._fullmoves=new List();
		this._selectedMove=null;
		this._lastMove=null;
	}

	History.prototype.move=function(move) {
		var historyMove=new Move(move);
		var lastFullmove=this._fullmoves.lastItem();

		if(lastFullmove===null || move.getColour()===WHITE) {
			lastFullmove=this._fullmoves.add(new Fullmove(this._template.root, move.getFullmove()));
		}

		lastFullmove.add(historyMove);

		historyMove.UserSelect.addHandler(this, function() {
			this.select(historyMove);
		});

		historyMove.setPreviousItem(this._lastMove);

		if(this._lastMove!==null) {
			this._lastMove.setNextItem(historyMove);
		}
		
		this._lastMove=historyMove;

		this.select(historyMove);
	}

	History.prototype.undo=function() {
		var move=this._lastMove;
		var fullmove;
		var previousMove;

		if(move!==null) {
			previousMove=move.getPreviousMove();
			fullmove=move.getParentFullmove();
			fullmove.remove(move);

			if(fullmove.isEmpty()) {
				this._fullmoves.remove(fullmove);
				this._template.root.removeChild(fullmove.node);
			}

			if(previousMove!==null) {
				previousMove.setNextItem(null);
			}

			this._lastMove=previousMove;
		}
	}

	History.prototype.clear=function() {
		this._template.root.innerHTML="";
	}

	History.prototype.getLastMove=function() {
		var fullmove=this._fullmoves.lastItem();

		if(fullmove!==null) {
			return fullmove.getLastMove();
		}

		else {
			return null;
		}
	}

	History.prototype.select=function(move) {
		if(this._selectedMove!==null) {
			this._selectedMove.deselect();
		}

		if(move!==null) {
			move.select();
		}

		this._selectedMove=move;
	}

	return History;
});
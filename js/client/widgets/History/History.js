define(function(require) {
	var List = require("lib/List");
	var Event = require("lib/Event");
	var Move = require("./_Move/Move");
	var Fullmove = require("./_Fullmove/Fullmove");
	var Template = require("lib/dom/Template");
	var html = require("file!./resources/history.html");
	var Piece = require("chess/Piece");
	require("css!./resources/history.css");

	function History(parent) {
		this.UserSelect = new Event(this);
		this._template = new Template(html, parent);
		this._fullmoves = new List();
		this._selectedMove = null;
	}

	History.prototype.move = function(move) {
		var historyMove = new Move(move);
		var lastFullmove = this._fullmoves.getLastItem();

		if(lastFullmove === null || move.getColour() === Piece.WHITE) {
			lastFullmove = this._fullmoves.push(new Fullmove(this._template.root, move.getFullmove()));
		}

		lastFullmove.add(historyMove);

		historyMove.UserSelect.addHandler(this, function() {
			this.select(historyMove);
			
			this.UserSelect.fire({
				move: historyMove
			});
		});

		this.select(historyMove);
	}

	History.prototype.undo = function() {
		var move = this.getLastMove();
		var fullmove;

		if(move !== null) {
			fullmove = move.getParentFullmove();
			fullmove.remove(move);

			if(fullmove.isEmpty()) {
				this._fullmoves.remove(fullmove);
				fullmove.removeNode();
			}

			if(previousMove !== null) {
				previousMove.setNextItem(null);
			}

			this._lastMove = previousMove;
		}
		
		if(this._selectedMove === move) {
			this.select(this.getLastMove());
		}
	}

	History.prototype.clear = function() {
		this._template.root.innerHTML = "";
		this._fullmoves = [];
	}

	History.prototype.getLastMove = function() {
		var fullmove = this._fullmoves.getLastItem();

		if(fullmove !== null) {
			return fullmove.getLastMove();
		}

		else {
			return null;
		}
	}

	History.prototype.select = function(move) {
		if(this._selectedMove !== null) {
			this._selectedMove.deselect();
		}

		if(move !== null) {
			move.select();
		}

		this._selectedMove = move;
	}

	return History;
});
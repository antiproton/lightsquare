define(function(require) {
	var Event = require("lib/Event");
	var Fullmove = require("./Fullmove");
	var Ractive = require("lib/dom/Ractive");
	var Colour = require("chess/Colour");
	require("lib/Array.remove");
	var html = require("file!./resources/history.html");
	require("css!./resources/history.css");

	function History(parent) {
		this.UserSelect = new Event(this);
		
		this._template = new Ractive({
			template: html,
			el: parent,
			data: {
				selectedFullLabel: null,
				fullmoves: []
			}
		});
		
		this._fullmoves = [];
	}

	History.prototype.move = function(move) {
		var lastFullmove = this._getLastFullmove();

		if(lastFullmove === null || move.getColour() === Colour.white) {
			lastFullmove = this._fullmoves.push(new Fullmove());
		}

		lastFullmove.add(move);
	}

	History.prototype.undo = function() {
		var fullmove = this._getLastFullmove();
		var move = this.getLastMove();
		var fullmove;

		//if(move !== null) {
		//	fullmove = move.getParentFullmove();
		//	fullmove.remove(move);
		//
		//	if(fullmove.isEmpty()) {
		//		this._fullmoves.remove(fullmove);
		//		fullmove.removeNode();
		//	}
		//
		//	if(previousMove !== null) {
		//		previousMove.setNextItem(null);
		//	}
		//
		//	this._lastMove = previousMove;
		//}
		//
		//if(this._selectedMove === move) {
		//	this.select(this.getLastMove());
		//}
	}

	History.prototype.select = function(move) {
		this._ractive.set("selectedFullLabel", move.getFullLabel());
	}

	History.prototype.clear = function() {
		this._ractive.set("fullmoves", []);
		this._fullmoves = [];
	}

	History.prototype.getLastMove = function() {
		var fullmove = this._getLastFullmove();

		if(fullmove !== null) {
			return fullmove.getLastMove();
		}

		else {
			return null;
		}
	}
	
	History.prototype._getLastFullmove = function() {
		return (this._fullmoves[this._fullmoves.length - 1] || null);
	}

	return History;
});
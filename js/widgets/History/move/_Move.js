define(function(require) {
	var ChessMove=require("chess/Move");
	var Event=require("lib/Event");

	function Move() {
		ChessMove.call(this);

		this.UserSelect=new Event(this);
	}

	Move.implement(ChessMove);

	Move.prototype.isFullmoveDisplayed=function() {
		if(this._variation!==null) {
			return (
				this.getColour()===WHITE
				|| this===this._variation.getFirstMove()
				|| this.getPreviousVariation()!==null
			);
		}

		else {
			return false;
		}
	}

	Move.prototype.select=function() {
		ChessMove.prototype.select.call(this);

		this.node.classList.add("move_selected");
	}

	Move.prototype.deselect=function() {
		ChessMove.prototype.deselect.call(this);

		this.node.classList.remove("move_selected");
	}

	return Move;
});
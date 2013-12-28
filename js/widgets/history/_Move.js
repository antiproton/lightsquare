define(function(require) {
	var Base=require("chess/history/Move");
	var Event=require("lib/Event");

	function Move(move) {
		Base.call(this, move);

		this.UserSelect=new Event(this);
	}

	Move.implement(Base);

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
		Base.prototype.select.call(this);

		this.node.classList.add("move_selected");
	}

	Move.prototype.deselect=function() {
		Base.prototype.deselect.call(this);

		this.node.classList.remove("move_selected");
	}

	return Move;
});
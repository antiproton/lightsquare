define(function(require) {
	var Move=require("chess/Move");
	var Event=require("./Event");
	var chess=require("chess");

	function UiMove() {
		Move.call(this);

		this.UserSelect=new Event(this);
	}

	UiMove.implement(Move);

	UiMove.prototype.isFullmoveDisplayed=function() {
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

	UiMove.prototype.select=function() {
		Move.prototype.select.call(this);

		this.node.classList.add("move_selected");
	}

	UiMove.prototype.deselect=function() {
		Move.prototype.deselect.call(this);

		this.node.classList.remove("move_selected");
	}

	return UiMove;
});
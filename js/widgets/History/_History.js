define(function(require) {
	var ChessHistory=require("chess/History");
	var Event=require("lib/Event");

	function History() {
		ChessHistory.call(this);

		this.UserSelect=new Event(this);
	}

	History.implement(ChessHistory);

	History.prototype.select=function(move) {
		ChessHistory.prototype.select.call(this, move);

		if(move!==null) {
			/*
			TODO make sure the move is in view if the history has a scrollbar
			*/
		}
	}

	History.prototype._setupMove=function(move) {
		move.UserSelect.addHandler(this, function(data, sender) {
			this.select(sender);
		});
	}

	return History;
});
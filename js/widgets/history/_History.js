define(function(require) {
	var Base=require("chess/history/History");
	var Event=require("lib/Event");

	function History() {
		Base.call(this);
	}

	History.implement(Base);

	History.prototype.select=function(move) {
		Base.prototype.select.call(this, move);

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
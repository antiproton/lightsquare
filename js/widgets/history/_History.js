define(function(require) {
	var History=require("chess/history/History");
	var Event=require("lib/Event");

	function Class() {
		History.call(this);
	}

	Class.implement(History);

	Class.prototype.select=function(move) {
		History.prototype.select.call(this, move);

		if(move!==null) {
			/*
			TODO make sure the move is in view if the history has a scrollbar
			*/
		}
	}

	Class.prototype._setupMove=function(move) {
		move.UserSelect.addHandler(this, function(data, sender) {
			this.select(sender);
		});
	}

	return Class;
});
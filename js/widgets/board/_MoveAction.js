define(function(require) {
	function MoveAction() {
		this.reset();
	}

	MoveAction.prototype.reset=function() {
		this.mode=MoveInfo.CLICK;
		this.selected=false;
		this.isInProgress=false;
		this.piece=null;
		this.from=null;
		this.mouseOffsets=[0, 0]
	}

	MoveAction.CLICK=0;
	MoveAction.DRAG=1;

	return MoveAction;
});
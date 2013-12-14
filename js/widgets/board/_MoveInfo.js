define(function(require) {
	function MoveInfo() {
		this.reset();
	}

	MoveInfo.prototype.reset=function() {
		this.mode=MoveInfo.CLICK;
		this.selected=false;
		this.isInProgress=false;
		this.piece=null;
		this.from=null;
		this.mouseOffsets=[0, 0]
	}

	MoveInfo.CLICK=0;
	MoveInfo.DRAG=1;

	return MoveInfo;
});
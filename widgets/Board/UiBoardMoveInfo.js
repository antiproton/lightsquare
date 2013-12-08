function UiBoardMoveInfo() {
	this.reset();
}

UiBoardMoveInfo.prototype.reset=function() {
	this.mode=UiBoardMoveInfo.CLICK;
	this.selected=false;
	this.isInProgress=false;
	this.piece=null;
	this.from=null;
	this.mouseOffsets=[0, 0]
}

UiBoardMoveInfo.CLICK=0;
UiBoardMoveInfo.DRAG=1;
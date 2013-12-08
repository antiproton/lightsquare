function _MoveInfo() {
	this.reset();
}

_MoveInfo.prototype.reset=function() {
	this.mode=_MoveInfo.CLICK;
	this.selected=false;
	this.isInProgress=false;
	this.piece=null;
	this.from=null;
	this.mouseOffsets=[0, 0]
}

_MoveInfo.CLICK=0;
_MoveInfo.DRAG=1;
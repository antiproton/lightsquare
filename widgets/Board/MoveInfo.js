function MoveInfo() {
	this.mode=MoveInfo.CLICK;
	this.selected=false;
	this.inProgress=false;
	this.piece=null;
	this.from=null;
	this.offsetX=0;
	this.offsetY=0;
}

MoveInfo.prototype.reset=function() {
	this.mode=MoveInfo.CLICK;
	this.selected=false;
	this.inProgress=false;
	this.piece=null;
	this.from=null;
	this.offsetX=0;
	this.offsetY=0;
}

MoveInfo.CLICK=0;
MoveInfo.DRAG_DROP=1;
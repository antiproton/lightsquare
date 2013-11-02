/*
the HTML version of the Lists used by History Variations.

still has Add, Remove etc like a List, but they affect nodes as well.
*/

function UiMoveList() {
	List.implement(this);
	this.Node=$("*span");
}

UiMoveList.prototype.Add=function(item) {
	this.Insert(item, this.Length);
}

UiMoveList.prototype.Insert=function(item, index) {
	var space=$("% ");

	if(index>=this.Length) {
		this.Node.appendChild(item.Node);
		this.Node.appendChild(space);
	}

	else {
		this.Node.insertBefore(space, this.Item(index).Node);
		this.Node.insertBefore(item.Node, space);
	}

	List.prototype.Insert.call(this, item, index);
}

/*
Remove completely replaces List::Remove so that moves can be removed
by their index.  A move can be passed, or just an object with the MoveIndex
property set to whichever move needs removing.

FIXME is any of that true?  doesn't look like it
*/

UiMoveList.prototype.Remove=function(item) {
	List.prototype.Remove.call(this, item);
	Dom.RemoveNode(item.Node);
}
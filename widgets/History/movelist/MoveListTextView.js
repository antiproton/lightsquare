function MoveListTextView(parent) {
	List.implement(this);

	this.tpl=new Template("move_list_textview", parent);
}

MoveListTextView.prototype.Add=function(item) {
	this.Insert(item, this.Length);
}

MoveListTextView.prototype.Insert=function(item, index) {
	var space=t(" ");

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

MoveListTextView.prototype.Remove=function(item) {
	List.prototype.Remove.call(this, item);
	Dom.RemoveNode(item.Node);
}
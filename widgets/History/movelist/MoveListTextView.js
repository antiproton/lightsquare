function MoveListTextView(parent) {
	List.implement(this);

	this._tpl=new Template("move_list_textview", parent);
}

MoveListTextView.prototype.add=function(item) {
	this.insert(item, this.length);
}

MoveListTextView.prototype.insert=function(item, index) {
	var space=t(" ");

	if(index>=this.Length) {
		this.node.appendChild(item.node);
		this.node.appendChild(space);
	}

	else {
		this.node.insertBefore(space, this.item(index).node);
		this.node.insertBefore(item.node, space);
	}

	List.prototype.insert.call(this, item, index);
}

MoveListTextView.prototype.remove=function(item) {
	List.prototype.remove.call(this, item);
	item.remove();
}
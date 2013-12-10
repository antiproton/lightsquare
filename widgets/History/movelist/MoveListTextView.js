function MoveListTextView() {
	List.implement(this);

	this._template=new Template("move_list_textview");
	this.node=this._template.root;
}

MoveListTextView.prototype.add=function(item) {
	this.insert(item, this.length);
}

MoveListTextView.prototype.insert=function(item, index) {
	var space=t(" ");

	if(index>=this.length) {
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
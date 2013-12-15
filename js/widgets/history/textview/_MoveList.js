define(function(require, exports, module) {
	var Template=require("lib/dom/Template");
	var List=require("lib/List");
	var html=require("file@./resources/movelist.html");

	function MoveList() {
		List.call(this);

		this._template=new Template(html);
		this.node=this._template.root;
	}

	MoveList.implement(List);

	MoveList.prototype.add=function(item) {
		this.insert(item, this.length);
	}

	MoveList.prototype.insert=function(item, index) {
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

	MoveList.prototype.remove=function(item) {
		List.prototype.remove.call(this, item);
		item.remove();
	}

	return MoveList;
});
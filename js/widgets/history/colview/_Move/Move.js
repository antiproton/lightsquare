define(function(require) {
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/move.html");

	function Move(move) {
		this._move=move;
		this._parentFullmove=null;
		this._template=new Template(html);
		this._template.root.innerHTML=this._move.getLabel();
		this.node=this._template.root;
	}

	Move.prototype.setParentFullmove=function(fullmove) {
		this._parentFullmove=fullmove;
	}

	Move.prototype.getParentFullmove=function() {
		return this._parentFullmove;
	}

	return Move;
});
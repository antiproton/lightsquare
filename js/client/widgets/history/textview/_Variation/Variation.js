define(function(require) {
	var Variation=require("chess/history/Variation");
	var MoveList=require("./_MoveList/MoveList");
	var html=require("file@./resources/variation.html");

	function Class() {
		Variation.call(this);

		this._template=new Template(html);
		this._template.root.appendChild(this.moveList.node);
		this.node=this._template.root;
	}

	Class.implement(Variation);

	Class.prototype.createMoveList=function() {
		return new MoveList();
	}

	return Class;
});
define(function(require) {
	var Base=require("chess/Variation");
	var MoveList=require("./_MoveList");

	function Variation() {
		Base.call(this);

		this._template=new Template("variation_textview");
		this._template.root.appendChild(this.moveList.node);
		this.node=this._template.root;
	}

	Variation.implement(Base);

	Variation.prototype.createMoveList=function() {
		return new MoveList();
	}

	return Variation;
});
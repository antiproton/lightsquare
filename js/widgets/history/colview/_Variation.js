define(function(require) {
	var Base=require("chess/Variation");

	function Variation() {
		Base.call(this);

		this._template=new Template("variation_colview");
		this._template.root.appendChild(this.moveList.node);
		this.node=this._template.root;
	}

	Variation.implement(Base);

	Variation.prototype._createMoveList=function() {
		return new MoveList();
	}

	return Variation;
});
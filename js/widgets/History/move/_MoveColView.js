define(function(require) {
	var Template=require("lib/dom/Template");
	var Move=require("./_Move");

	function MoveColView() {
		Move.call(this);

		this._parentFullmove=null;
		this._template=new Template("move_colview");
		this.node=this._template.root;
	}

	MoveColView.implement(Move);

	MoveColView.prototype.setLabel=function(label) {
		Move.prototype.setLabel.call(this, label);

		this.node.innerHTML=label;
	}

	MoveColView.prototype.isFullmoveDisplayed=function() {
		return false;
	}

	MoveColView.prototype.setParentFullmove=function(fullmove) {
		this._parentFullmove=fullmove;
	}

	MoveColView.prototype.getParentFullmove=function() {
		return this._parentFullmove;
	}

	return MoveColView;
});
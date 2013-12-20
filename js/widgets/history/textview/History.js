define(function(require) {
	var History=require("../_History");
	var Variation=require("./_Variation/Variation");
	var Move=require("./_Move/Move");
	var Template=require("lib/dom/Template");
	require("css@./resources/history.css");
	var html=require("file@./resources/history.html");

	function Class(parent) {
		History.call(this);

		this._template=new Template(html, parent);
		this._template.root.appendChild(this.mainLine.node);
	}

	Class.implement(Base);

	Class.prototype.createMove=function() {
		var move=new Move();

		this._setupMove(move);

		return move;
	}

	Class.prototype.createVariation=function() {
		return new Variation();
	}

	return Class;
});
define(function(require) {
	var Base=require("../_History");
	var Variation=require("./_Variation/Variation");
	var Move=require("./_Move/Move");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/history.html");
	require("css@./resources/history.css");

	function History(parent) {
		Base.call(this);

		this._template=new Template(html, parent);
		this._template.root.appendChild(this.mainLine.node);
	}

	History.implement(Base);

	History.prototype.move=function(move) {
		this.mainLine.add(move);

		this.Moved.fire({
			move: move
		});

		this.select(move);

		return true;
	}

	History.prototype.createVariation=function() {
		return new Variation();
	}

	History.prototype.createMove=function() {
		var move=new Move();

		this._setupMove(move);

		return move;
	}

	return History;
});
define(function(require) {
	var Event=require("lib/Event");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/move.html");
	require("css@./resources/move.css");

	function Move(move) {
		this._move=move;

		this.UserSelect=new Event(this);

		this._parentFullmove=null;
		this._template=new Template(html);
		this._template.root.innerHTML=this._move.getLabel();
		this.node=this._template.root;

		this._setupHtml();
	}

	Move.prototype._setupHtml=function() {
		var self=this;
		
		this.node.addEventListener("click", function() {
			self.UserSelect.fire();
		});
	}

	Move.prototype.setParentFullmove=function(fullmove) {
		this._parentFullmove=fullmove;
	}

	Move.prototype.getParentFullmove=function() {
		return this._parentFullmove;
	}

	Move.prototype.select=function() {
		this.node.classList.add("move_colview_selected");
	}

	Move.prototype.deselect=function() {
		this.node.classList.remove("move_colview_selected");
	}
	
	Move.prototype.getFullmove=function() {
		return this._move.getFullmove();
	}

	Move.prototype.getColour=function() {
		return this._move.getColour();
	}

	Move.prototype.getDot=function() {
		return this._move.getDot();
	}

	Move.prototype.getLabel=function() {
		return this._move.getLabel();
	}

	Move.prototype.getFullLabel=function() {
		return this._move.getFullLabel();
	}

	Move.prototype.getResultingFen=function() {
		return this._move.getResultingFen();
	}
	
	Move.prototype.getTime=function() {
		return this._move.getTime();
	}

	return Move;
});
define(function(require) {
	var Event=require("lib/Event");
	var Base=require("chess/history/Move");
	var Template=require("lib/dom/Template");
	var html=require("file@./resources/move.html");
	require("css@./resources/move.css");

	function Move(move) {
		Base.call(this, move);

		this.UserSelect=new Event(this);

		this._parentFullmove=null;
		this._template=new Template(html);
		this._template.root.innerHTML=this._move.getLabel();
		this.node=this._template.root;

		this._setupHtml();
	}

	Move.implement(Base);

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

	return Move;
});
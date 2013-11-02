/*
this is a control that doesn't automatically add itself
to its parent, so calling code has to add its node to
whatever element it needs to be in and then call its
SetupHtml.
*/

function IUiMove() {
	IUiMoveListElementCommon.implement(this);
	this.Node=$("*span");

	this.UserSelect=new Event(this);

	this.style_deselected={
		border: "1px solid transparent"
	};

	this.style_selected={};

	this.StyleSelected=new Property(this, function() {
		return this.style_selected;
	}, function(value) {
		this.style_selected=value;

		/*
		make sure each prop is set back to how it was before when deselected, in case it isn't explicitly
		set in StyleDeselected
		*/

		for(var p in value) {
			if(!this.style_deselected.hasOwnProperty(p)) {
				this.style_deselected[p]=this.Node.style[p];
			}
		}

		this.UpdateHtml();
	});

	this.StyleDeselected=new Property(this, function() {
		return this.style_deselected;
	}, function(value) {
		this.style_deselected=value;
		this.UpdateHtml();
	});

	this.StyleSelected.Set({
		border: "1px solid #DBB74C",
		backgroundColor: "#FFFBB2"
	});

	this.NodeHeight=new Property(this, function() {
		return this.Node.offsetHeight;
	});
}

IUiMove.prototype.SetupHtml=function() {
	IUiMoveListElementCommon.prototype.SetupHtml.call(this);

	var self=this;

	/*
	inner_span - the move label spans need to be whiteSpace: nowrap so that the
	move and the fullmove number don't get separated over two lines, but then there
	needs to be some spaces so that the moves don't all come on one line.
	the spaces can get added to the move node for this purpose without affecting
	the label node.
	*/

	this.inner_span=$("*span");

	Dom.AddEventHandler(this.Node, "click", function() {
		self.UserSelect.Fire();
	});

	Dom.Style(this.Node, {
		whiteSpace: "nowrap",
		cursor: "pointer"
	});

	this.UpdateHtml();
}

/*
NOTE this is done for every move every time a move is made, a move is
deleted, a variation is promoted, etc.  almost might as well have just
gone the route of keeping everything in a code-only history and
doing a full refresh of the ui version each time.

BUT could have everything available (fullmove, dot, space_l etc) and
then show/hide them here.

also will need to make sure there is definitely at least one space every
time, otherwise all will come on one line
*/

IUiMove.prototype.UpdateHtml=function() {
	if(this.html_is_setup) {
		Dom.ClearNode(this.Node);
		Dom.ClearNode(this.inner_span);

		Dom.Style(this.inner_span, {
			whiteSpace: "nowrap"
		});

		if(this.PreviousItem!==null) {
			//this.Node.appendChild($("%\u00a0"));
		}

		var label=this.GetLabel();

		if(this.DisplayFullmove) {
			label=this.GetFullLabel();
		}

		this.Node.appendChild(this.inner_span);
		this.inner_span.appendChild($("%"+label+""));

		if(this.NextItem!==null) {
			this.Node.appendChild($("%\u00a0"));
		}
	}
}

IUiMove.prototype.Select=function() {
	Dom.Style(this.inner_span, this.style_selected);
}

IUiMove.prototype.Deselect=function() {
	Dom.Style(this.inner_span, this.style_deselected);
}

/*
PointersUpdated

this is probably the one place where the logical sectioning off of
general, abstract functions and ui code breaks down slightly -
it has to be called in Variation::UpdatePointers so that moves
update whether they should be displaying the 1./1... thing before
the label, but it is meaningless in the context from which it has
to be called.

NOTE this is the calling code saying "your pointers have been updated"
not asking "have your pointers been updated?"
*/

IUiMove.prototype.PointersUpdated=function() {
	this.UpdateHtml();
}
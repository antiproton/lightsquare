<!--###
UiMove.prototype.SetupHtml=function() {

	var self=this;

	/*
	inner_span - the move label spans need to be whiteSpace: nowrap so that the
	move and the fullmove number don't get separated over two lines, but then there
	needs to be some spaces so that the moves don't all come on one line.
	the spaces can get added to the move node for this purpose without affecting
	the label node.
	*/

	this.inner_span=c("span");

	Dom.AddEventHandler(this.Node, "click", function() {
		self.UserSelect.Fire();
	});

	Dom.Style(this.Node, {
		whiteSpace: "nowrap",
		cursor: "pointer"
	});

	this.UpdateHtml();
}

UiMove.prototype.UpdateHtml=function() {
	if(this.html_is_setup) {
		Dom.ClearNode(this.Node);
		Dom.ClearNode(this.inner_span);

		Dom.Style(this.inner_span, {
			whiteSpace: "nowrap"
		});

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
###-->
<div class="template" id="move_textview">
	<span data-id="root" data-class="root">
		<span data-id="fullmove"></span>
		<span data-id="label"></span>
	</span>
</div>
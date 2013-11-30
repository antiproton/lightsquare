<!--###
/*
NOTE the combination of spaces, non-breaking spaces (\u00a0) and whiteSpace: nowrap here
is essential for keeping the move list looking right

the nowrap (here and in the UiMoves) stop any moves getting indented on the left.
*/

UiVariation.prototype.SetupHtml=function() {
	IUiMoveListElementCommon.prototype.SetupHtml.call(this);

	if(!this.IsMainline) {
		this.BracketL=c("span");
		this.Node.appendChild(this.BracketL);
		this.BracketL.innerHTML=" ( ";

		Dom.Style(this.BracketL, {
			whiteSpace: "nowrap"
		});
	}

	this.Node.appendChild(this.Line.Node);

	if(!this.IsMainline) {
		this.BracketR=c("span");
		this.Node.appendChild(this.BracketR);
		this.BracketR.appendChild($("%)\u00a0")); //FIXME innerHTML=")&nbsp;" will probably work here

		Dom.Style(this.BracketR, {
			whiteSpace: "nowrap"
		});
	}
}
###
-->
<div class="template" id="variation_textview">
	<div data-id="root" data-class="root">

	</div>
</div>
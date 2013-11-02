function UiVariation(history, is_mainline) {
	Variation.implement(this, history, is_mainline);
	IUiMoveListElementCommon.implement(this);

	this.BracketL=null;
	this.BracketR=null;
	this.Node=$("*span");

	//parent adds node

	this.Line=new UiMoveList();
}

/*
NOTE the combination of spaces, non-breaking spaces (\u...) and whiteSpace: nowrap here
is essential for keeping the move list looking right

the nowrap (here and in the UiMoves) stop any moves getting indented on the left.
*/

UiVariation.prototype.SetupHtml=function() {
	IUiMoveListElementCommon.prototype.SetupHtml.call(this);

	if(!this.IsMainline) {
		this.BracketL=$("*span");
		this.Node.appendChild(this.BracketL);
		this.BracketL.appendChild($("% ( "));

		Dom.Style(this.BracketL, {
			whiteSpace: "nowrap"
		});
	}

	this.Node.appendChild(this.Line.Node);

	if(!this.IsMainline) {
		this.BracketR=$("*span");
		this.Node.appendChild(this.BracketR);
		this.BracketR.appendChild($("%)\u00a0"));

		Dom.Style(this.BracketR, {
			whiteSpace: "nowrap"
		});
	}

	Dom.Style(this.Node, {
		cursor: "default"
	});

	this.UpdateHtml();
}

UiVariation.prototype.UpdateHtml=function() {

}

UiVariation.prototype.Insert=function(item, index, dont_update) {
	Variation.prototype.Insert.apply(this, arguments);
	this.SetupItem(item);
}

UiVariation.prototype.SetupItem=function(item) {
	var self=this;

	if(!item.HtmlIsSetup.Get()) {
		item.SetupHtml(); //done here because it has to be after UpdatePointers for working out 1./1... etc

		if(!item.IsVariation) {
			item.UserSelect.AddHandler(this, function(data, sender) {
				self.History.Select(sender);
			});
		}
	}
}

UiVariation.prototype.PointersUpdated=function() {
	this.UpdateHtml();
}
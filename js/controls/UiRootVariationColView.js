function UiRootVariationColView(history) {
	Variation.implement(this, history, true);
	this.Node=$("*div");

	this.Line=new UiMoveListColView();
}

UiRootVariationColView.prototype.SetupHtml=function() {
	this.Node.appendChild(this.Line.Node);

	Dom.Style(this.Node, {
		cursor: "default"
	});

	this.UpdateHtml();
}

UiRootVariationColView.prototype.UpdateHtml=function() {

}

UiRootVariationColView.prototype.Insert=function(item, index, dont_update) {
	Variation.prototype.Insert.apply(this, arguments);
	this.SetupItem(item);
}

UiRootVariationColView.prototype.SetupItem=function(item) {
	var self=this;

	if(!item.HtmlIsSetup.Get()) {
		this.Line.InsertHtml(item); //done here because it has to be after UpdatePointers for working out 1./1... etc

		item.UserSelect.AddHandler(this, function(data, sender) {
			self.History.Select(sender);
		});
	}
}
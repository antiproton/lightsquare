/*
the column-ness is handled from UiRootVariationColView downwards
(UiRootVariationColView, IUiMoveListColView, IUiMoveColView)

NOTE the ColView one is kind of hacked on top of the standard history
classes, which support variations.  The main areas where it does things
differently will be to do with not allowing/not needing to support
variations.  The reason it isn't just a completely separate class is
because it still needs to look the same as any other history from
the outside, so although the concept of a root variation or main line
doesn't really mean anything because there is only one line, .MainLine
still needs to return a thing that looks like a Variation with the main
line in it.
*/

function UiHistoryColView(parent) {
	IUiHistory.implement(this, parent);

	this.Padding.Set(0);
	this.Width.Set(160);
	this.Height.Set(120);
}

UiHistoryColView.prototype.get_new_variation=function() {
	/*
	this will only be called once in IHistoryCommon to set up the root variation.

	NOTE the only way to understand any of this code is to follow it along the
	completely unintuitive path it takes through a bunch of different prototypes.

	some of the reason for having it laid out so weirdly is ordering difficulties
	(HTML elements have to exist for certain parts to work; common sense says to
	do it the other way round.  Et cetera.)
	*/

	return new UiRootVariationColView(this);
}

UiHistoryColView.prototype.Move=function(move) {
	IUiMoveColView.implement(move);

	return IHistoryCommon.prototype.Move.call(this, move);
}
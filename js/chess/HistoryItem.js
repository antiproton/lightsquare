/*
history item - a move or a variation
*/

function HistoryItem() {
	this.ResetPointers();
}

HistoryItem.prototype.ResetPointers=function() {
	this.Variation=null;
	this.PreviousMove=null;
	this.PreviousVariation=null;
	this.NextMove=null;
	this.NextVariation=null;
	this.PreviousItem=null;
	this.NextItem=null;
	this.ItemIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 3 (variations are counted).  Nc3 is 1.
}

HistoryItem.prototype.SetVariation=function(variation) {
	this.Variation=variation;
}

HistoryItem.prototype.SetPreviousMove=function(move) {
	this.PreviousMove=move;
}

HistoryItem.prototype.SetPreviousVariation=function(variation) {
	this.PreviousVariation=variation;
}

HistoryItem.prototype.SetNextMove=function(move) {
	this.NextMove=move;
}

HistoryItem.prototype.SetNextVariation=function(variation) {
	this.NextVariation=variation;
}

HistoryItem.prototype.SetPreviousItem=function(item) {
	this.PreviousItem=item;
}

HistoryItem.prototype.SetNextItem=function(item) {
	this.NextItem=item;
}

HistoryItem.prototype.SetItemIndex=function(index) {
	this.ItemIndex=index;
}
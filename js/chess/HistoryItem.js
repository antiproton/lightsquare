/*
history item - a move or a variation
*/

function HistoryItem() {
	this.resetPointers();
}

HistoryItem.prototype.resetPointers=function() {
	this.variation=null;
	this.previousMove=null;
	this.previousVariation=null;
	this.nextMove=null;
	this.nextVariation=null;
	this.previousItem=null;
	this.nextItem=null;
	this.itemIndex=null; //e4 e5 (h5 Nc3) d4 //d4 is 3 (variations are counted).  Nc3 is 1.
}

HistoryItem.prototype.setVariation=function(variation) {
	this.variation=variation;
}

HistoryItem.prototype.setPreviousMove=function(move) {
	this.previousMove=move;
}

HistoryItem.prototype.setPreviousVariation=function(variation) {
	this.previousVariation=variation;
}

HistoryItem.prototype.setNextMove=function(move) {
	this.nextMove=move;
}

HistoryItem.prototype.setNextVariation=function(variation) {
	this.nextVariation=variation;
}

HistoryItem.prototype.setPreviousItem=function(item) {
	this.previousItem=item;
}

HistoryItem.prototype.setNextItem=function(item) {
	this.nextItem=item;
}

HistoryItem.prototype.setItemIndex=function(index) {
	this.itemIndex=index;
}
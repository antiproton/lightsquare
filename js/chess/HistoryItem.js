/*
history item - a move or a variation
*/

function HistoryItem() {
	this.resetPointers();
}

HistoryItem.prototype.resetPointers=function() {
	this._variation=null;
	this._previousMove=null;
	this._previousVariation=null;
	this._nextMove=null;
	this._nextVariation=null;
	this._previousItem=null;
	this._nextItem=null;
	this._itemIndex=null;
}

HistoryItem.prototype.getVariation=function() {
	return this._variation;
}

HistoryItem.prototype.getPreviousMove=function() {
	return this._previousMove;
}

HistoryItem.prototype.getPreviousVariation=function() {
	return this._previousVariation;
}

HistoryItem.prototype.getNextMove=function() {
	return this._nextMove;
}

HistoryItem.prototype.getNextVariation=function() {
	return this._nextVariation;
}

HistoryItem.prototype.getPreviousItem=function() {
	return this._previousItem;
}

HistoryItem.prototype.getNextItem=function() {
	return this._nextItem;
}

HistoryItem.prototype.getItemIndex=function() {
	return this._itemIndex;
}

HistoryItem.prototype.setVariation=function(variation) {
	this._variation=variation;
}

HistoryItem.prototype.setPreviousMove=function(move) {
	this._previousMove=move;
}

HistoryItem.prototype.setPreviousVariation=function(variation) {
	this._previousVariation=variation;
}

HistoryItem.prototype.setNextMove=function(move) {
	this._nextMove=move;
}

HistoryItem.prototype.setNextVariation=function(variation) {
	this._nextVariation=variation;
}

HistoryItem.prototype.setPreviousItem=function(item) {
	this._previousItem=item;
}

HistoryItem.prototype.setNextItem=function(item) {
	this._nextItem=item;
}

HistoryItem.prototype.setItemIndex=function(index) {
	this._itemIndex=index;
}
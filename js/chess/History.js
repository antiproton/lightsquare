function History() {
	IHistoryCommon.implement(this);
}

History.prototype.get_new_variation=function(is_mainline) {
	return new Variation(this, is_mainline);
}
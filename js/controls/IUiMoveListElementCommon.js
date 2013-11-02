function IUiMoveListElementCommon() {
	this.html_is_setup=false;

	this.HtmlIsSetup=new Property(this, function() {
		return this.html_is_setup;
	});
}

IUiMoveListElementCommon.prototype.SetupHtml=function() {
	this.html_is_setup=true; //this is key to it not adding those stupid extra brackets when it gets promoted.
}
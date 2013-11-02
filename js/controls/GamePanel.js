function GamePanel(parent) {
	Control.implement(this, parent);

	this.SetupHtml();
}

GamePanel.prototype.SetupHtml=function() {
	var self=this;
	var container;

	this.inner=div(this.Node);

	/*
	game set up controls for custom tables
	*/

	this.CustomTableContainer=new Container(this.inner);

	container=div(this.CustomTableContainer.Node);

	this.ButtonReady=new Button(container, "Ready");
	this.ButtonStand=new Button(container, "Stand");


	/*
	game set up controls for quick challenges
	*/

	this.QuickChallengeContainer=new Container(this.inner);

	container=div(this.QuickChallengeContainer.Node);

	this.ButtonRematch=new Button(container, "Rematch");
	this.ButtonDeclineRematch=new Button(container, "Decline");

	container=div(this.QuickChallengeContainer.Node);

	this.ButtonNew=new Button(container, "New game");

	container=div(this.inner);

	this.ButtonResign=new Button(container, "Resign");
	this.ButtonDraw=new Button(container, "Draw");
	this.ButtonUndo=new Button(container, "Undo");

	this.ButtonUndo.Hide(); //TODO

	container=div(this.inner);

	this.ButtonClaimThreefold=new Button(container, "Claim Threefold");
	this.ButtonClaimFiftymove=new Button(container, "Claim 50-move");

	this.UpdateHtml();
}

GamePanel.prototype.UpdateHtml=function() {

}
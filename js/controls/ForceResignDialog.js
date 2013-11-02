function ForceResignDialog(parent) {
	Control.implement(this, parent);

	this.width=300;
	this.z_index=1;

	this.Zindex=new Property(this, function() {
		return this.z_index;
	}, function(value) {
		this.z_index=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

ForceResignDialog.prototype.SetupHtml=function() {
	Dom.Style(this.Node, {
		position: "absolute",
		display: "none",
		width: this.width,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#bfbfbf",
		borderRadius: 3,
		//boxShadow: "0px 0px 3px 1px rgba(0, 0, 0, .3)",
		boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, .4)",
		backgroundColor: "#ffffff"
	});

	this.inner_container=div(this.Node);

	Dom.Style(this.inner_container, {
		textAlign: "center",
		fontSize: 11,
		padding: 6
	});

	this.title_inner=div(this.inner_container);
	this.message_inner=div(this.inner_container);
	this.buttons_inner=div(this.inner_container);

	Dom.Style(this.title_inner, {
		fontSize: 13,
		fontWeight: "bold"
	});

	Dom.Style(this.message_inner, {
		marginTop: 10,
		marginBottom: 10
	});

	//this.title_inner.innerHTML="Opponent disconnected";

	var msg="";
	msg+="Your opponent has left the game."
	//msg+="If they have abandoned a lost position, you can take this as resignation ";
	//msg+="and force a forfeit.  If

	this.message_inner.innerHTML=msg;

	this.ButtonForce=new Button(this.buttons_inner, "Force resignation");
	//this.ButtonCancel=new Button(this.buttons_inner, "<b>Cancel game</b><br>(game not out of the opening yet)");
	this.ButtonWait=new Button(this.buttons_inner, "Wait");

	this.ButtonWait.Click.AddHandler(this, function() {
		this.Hide();
	});

	this.UpdateHtml();
}

ForceResignDialog.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		zIndex: this.z_index
	});
}

/*
set the location of the center
*/

ForceResignDialog.prototype.SetLocation=function(x, y) {
	var height=this.Node.offsetHeight;

	if(height===0) { //if node is hidden when location set, use a sensible default
		height=100;
	}

	Dom.Style(this.Node, {
		top: y-Math.round(height/2),
		left: x-Math.round(this.width/2)
	});
}
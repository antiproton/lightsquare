function GameOverDialog(parent) {
	Control.implement(this, parent);

	this.width=280;
	this.height=320;
	this.z_index=1;
	this.result=RESULT_WHITE;

	this.Zindex=new Property(this, function() {
		return this.z_index;
	}, function(value) {
		this.z_index=value;
		this.UpdateHtml();
	});

	this.Result=new Property(this, function() {
		return this.result;
	}, function(value) {
		this.result=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

GameOverDialog.prototype.SetupHtml=function() {
	Dom.Style(this.Node, {
		position: "absolute",
		display: "none",
		width: this.width,
		height: this.height,
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
	this.result_inner=div(this.inner_container);
	this.result_details_inner=div(this.inner_container);
	this.message_inner=div(this.inner_container);
	this.buttons_inner=div(this.Node);

	Dom.Style(this.result_inner, {
		fontSize: 18,
		marginTop: 12
	});

	Dom.Style(this.result_details_inner, {
		marginTop: 7
	});

	Dom.Style(this.buttons_inner, {
		textAlign: "center",
		position: "absolute",
		top: this.height-30,
		width: this.width
	});

	this.title_inner.innerHTML="Game over";

	this.ButtonClose=new Button(this.buttons_inner, "Close");

	this.ButtonClose.Click.AddHandler(this, function() {
		this.Hide();
	});

	this.UpdateHtml();
}

GameOverDialog.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		zIndex: this.z_index
	});
}

GameOverDialog.prototype.Update=function(game) {
	this.result_inner.innerHTML=Result.String[game.Result];
	this.result_details_inner.innerHTML=Result.DetailsString(game)+".";
}

/*
set the location of the center
*/

GameOverDialog.prototype.SetLocation=function(x, y) {
	Dom.Style(this.Node, {
		top: y-Math.round(this.height/2),
		left: x-Math.round(this.width/2)
	});
}
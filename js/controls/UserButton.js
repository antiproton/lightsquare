/*
user status button in the top right

lets the user sign out, mess with prefs etc.
*/

function UserButton(x, y) {
	Control.implement(this, Dom.GetBody());

	this.x=x;
	this.y=y;
	this.dialog_open=false;
	this.border_radius=3;

	this.X=new Property(this, function() {
		return this.x;
	}, function(value) {
		this.x=value;
		this.UpdateHtml();
	});

	this.Y=new Property(this, function() {
		return this.y;
	}, function(value) {
		this.y=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

UserButton.prototype.SetupHtml=function() {
	var tmp;

	Dom.Style(this.Node, {
		fontSize: 12,
		position: "absolute",
		zIndex: 2
	});

	this.button=div(this.Node);

	Dom.Style(this.button, {
		cssFloat: "right",
		borderRadius: this.border_radius,
		padding: "1px 5px 3px 5px"
	});

	Dom.AddClass(this.button, "user_button");

	this.button.innerHTML=Base.App.User.Username;

	Dom.AddEventHandler(this.button, "click", function() {
		this.dialog_open=!this.dialog_open;
		this.UpdateHtml();
	}, this);

	cb(this.Node);

	this.container_dialog=new Container(this.Node);

	Dom.AddEventHandler(this.container_dialog.Node, "click", function() {
		Base.App.ClickedObjects.Add(this.container_dialog);
	}, this);

	Dom.AddEventHandler(this.button, "click", function() {
		Base.App.ClickedObjects.Add(this.button);
	}, this);

	Base.App.BodyClick.AddHandler(this, function() {
		if(this.dialog_open && !Base.App.ClickedObjects.Contains(this.container_dialog) && !Base.App.ClickedObjects.Contains(this.button)) {
			this.dialog_open=false;
			this.UpdateHtml();
		}
	});

	Dom.Style(this.container_dialog.Node, {
		borderTopLeftRadius: this.border_radius,
		borderBottomRightRadius: this.border_radius,
		borderBottomLeftRadius: this.border_radius
	});

	Dom.AddClass(this.container_dialog.Node, "user_dialog");

	this.container_dialog.Hide();

	this.inner_links=div(this.container_dialog.Node);
	Dom.AddClass(this.inner_links, "user_dialog_links");

	tmp=div(this.inner_links);

	tmp.innerHTML="Settings";

	tmp=div(tmp);

	Dom.Style(tmp, {
		cssFloat: "right"
	});

	this.link_signout=new Link(tmp, "Sign out", ap("/signout"));

	//cb(this.inner_links);

	this.inner_prefs=div(this.container_dialog.Node);

	Dom.Style(this.inner_prefs, {
		padding: 5
	});

	this.PrefsForm=new PrefsForm(this.inner_prefs);

	this.UpdateHtml();
}

UserButton.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		top: this.y,
		right: this.x
	});

	if(this.dialog_open) {
		this.container_dialog.Show();

		Dom.Style(this.button, {
			borderBottomRightRadius: 0,
			borderBottomLeftRadius: 0
		});
	}

	else {
		this.container_dialog.Hide();

		Dom.Style(this.button, {
			borderBottomRightRadius: this.border_radius,
			borderBottomLeftRadius: this.border_radius
		});
	}
}
function CustomButton(parent) {
	Control.implement(this);

	this.text=text;
	this.checked=false;
	this.Mode=CustomButton.MODE_NORMAL;

	this.Click=new Event(this);

	this.Text=new Property(this, function() {
		return this.text;
	}, function(value) {
		this.text=value;
		this.UpdateHtml();
	});

	this.Checked=new Property(this, function() {
		return this.checked;
	}, function(value) {
		this.checked=value;
		this.UpdateHtml();
	});
}

CustomButton.MODE_NORMAL=0;
CustomButton.MODE_CHECKBUTTON=1;

CustomButton.prototype.SetupHtml=function() {
	var self=this;

	Dom.Style(this.Node, {
		display: "inline-block",
		verticalAlign: "middle"
	});



	Dom.AddEventHandler(this.Node, "click", function() {
		Base.App.ClickedObjects.Add(self);
	});
}

CustomButton.prototype.UpdateHtml=function() {
	this.Node.innerHTML=this.text;
}
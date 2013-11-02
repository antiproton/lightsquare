function Panel(parent) {
	Control.implement(this, parent);

	this.width=170;
	this.background_color="transparent";
	this.background_image="x/img/panel.gif";
	this.padding=0;
	this.border_colour="#b4b4b4";
	this.border_width=0;
	this.font_size=11;

	this.BorderColor=new Property(this, function() {
		return this.border_colour;
	}, function(value) {
		this.border_colour=value;
		this.UpdateHtml();
	});

	this.BorderWidth=new Property(this, function() {
		return this.border_width;
	}, function(value) {
		this.border_width=value;
		this.UpdateHtml();
	});

	this.BackgroundColor=new Property(this, function() {
		return this.background_color;
	}, function(value) {
		this.background_color=value;
		this.UpdateHtml();
	});

	this.BackgroundImage=new Property(this, function() {
		return this.background_image;
	}, function(value) {
		this.background_image=value;
		this.UpdateHtml();
	});

	this.Padding=new Property(this, function() {
		return this.padding;
	}, function(value) {
		this.padding=value;
		this.UpdateHtml();
	});

	this.Width=new Property(this, function() {
		return this.width;
	}, function(value) {
		this.width=value;
		this.UpdateHtml();
	});

	this.FontSize=new Property(this, function() {
		return this.font_size;
	}, function(value) {
		this.font_size=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

Panel.prototype.SetupHtml=function() {
	this.border=div(this.Node);
	this.inner=div(this.border);

	Dom.Style(this.border, {
		borderRadius: 2
	});

	this.UpdateHtml();
}

Panel.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		fontSize: this.font_size,
		fontFamily: "verdana",
		width: this.width
	});

	Dom.Style(this.border, {
		borderStyle: "solid",
		borderColor: this.border_colour,
		borderWidth: this.border_width,
		backgroundColor: this.background_color
	});

	if(this.background_image!==null) {
		Dom.Style(this.border, {
			backgroundPosition: "left top",
			backgroundRepeat: "repeat-x"
		});
	}

	else {
		Dom.Style(this.border, {
			backgroundImage: "none"
		});
	}

	Dom.Style(this.inner, {
		padding: this.padding
	});
}
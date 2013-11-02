function CustomTableForm(parent) {
	Control.implement(this, parent);

	this.width=300;
	this.padding=12;

	this.Width=new Property(this, function() {
		return this.width;
	}, function(value) {
		this.width=value;
		this.UpdateHtml();
	});

	this.Padding=new Property(this, function() {
		return this.padding;
	}, function(value) {
		this.padding=value;
		this.UpdateHtml();
	});

	this.CreateTable=new Event(this);

	this.SetupHtml();
}

CustomTableForm.prototype.SetupHtml=function() {
	this.inner_container=div(this.Node);

	Dom.Style(this.inner_container, {
		textAlign: "center"
	});

	this.links={};

	for(var code in DbEnums[GAME_TYPE]) {
		this.links[code]=new Link(this.inner_container, DbEnums[GAME_TYPE][code].Description);

		this.links[code].Click.AddHandler(this, (function(code) {
			return function() {
				this.CreateTable.Fire({
					Type: code
				});
			};
		})(code));

		Dom.Style(this.links[code].Node, {
			color: "#3E84C6",
			margin: "0 4px"
		});

		this.inner_container.appendChild($("%\u00a0|\u00a0"));
	}

	this.inner_container.removeChild(this.inner_container.lastChild)

	this.UpdateHtml();
}

CustomTableForm.prototype.UpdateHtml=function() {
	Dom.Style(this.inner_container, {
		padding: this.padding
	});
}
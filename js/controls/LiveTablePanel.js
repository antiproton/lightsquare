function LiveTablePanel(parent) {
	Control.implement(this, parent);

	this.SetupHtml();
}

LiveTablePanel.prototype.SetupHtml=function() {
	var self=this;
	var container;

	this.inner=div(this.Node);

	container=idiv(this.inner);
	this.DropDownVariant=new DropDown(container);

	Dom.Style(this.DropDownVariant.Node, {
		marginRight: 4
	});

	for(var code in DbEnums[VARIANT]) {
		this.DropDownVariant.Add(code, DbEnums[VARIANT][code].Description);
	}

	container=idiv(this.inner);
	this.DropDownSubvariant=new DropDown(container);

	Dom.Style(this.DropDownSubvariant.Node, {
		marginRight: 4
	});

	container=idiv(this.inner);
	this.DropDownChess960RandomiseMode=new DropDown(container);

	for(var code in DbEnums[CHESS960_RANDOMISE]) {
		this.DropDownChess960RandomiseMode.Add(code, DbEnums[CHESS960_RANDOMISE][code].Description);
	}

	container=idiv(this.inner);
	this.TimeSetting=new TimeSetting(container);

	Dom.Style(container, {
		marginRight: 5,
		marginLeft: 5
	});

	container=idiv(this.inner);
	this.CheckboxRated=new Checkbox(container, "Rated");

	Dom.Style(container, {
		marginRight: 5
	});

	container=idiv(this.inner);
	this.CheckboxAlternateColours=new Checkbox(container, "Alternate colours");

	Dom.Style(this.inner, {
		fontSize: 12
	});

	this.UpdateHtml();
}

LiveTablePanel.prototype.UpdateHtml=function() {

}
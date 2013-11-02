/*
table filters - maintain an object of filter criteria for live table lists.

the properties of the object map directly to fields that the table list xhrs
look for to build up the db query
*/

function TableFilter(parent) {
	Control.implement(this, parent);

	this.filters={};

	this.Filters=new Property(this, function() {
		var filters={};

		for(var field in this.filters) {
			if(this.filters[field]!==null) {
				filters[field]=this.filters[field];
			}
		}

		return filters;
	});

	this.Update=new Event(this);

	this.SetupHtml();
}

TableFilter.prototype.SetupHtml=function() {
	//filters label

	this.ContainerLabel=new LabelAndInputContainer(this.Node, {
		InputWidth: 0,
		LabelPadding: 7
	});

	Dom.Style(this.ContainerLabel.LabelInner, {
		fontWeight: "bold"
	});

	this.ContainerLabel.Label.Text.Set("Filters:");

	//type

	this.ContainerType=new LabelAndInputContainer(this.Node);

	var options=[];

	for(var code in DbEnums[GAME_TYPE]) {
		options.push({
			Value: code,
			Label: DbEnums[GAME_TYPE][code].Description
		});
	}

	this.SelectorFilterType=new SelectorButton(this.ContainerType.InputInner, options, true);
	this.SelectorFilterType.Value.Set(null);

	this.SelectorFilterType.SelectionChanged.AddHandler(this, function(data, sender) {
		this.filters["type"]=sender.Value.Get();
		this.update();
	});

	//variant

	this.ContainerVariant=new LabelAndInputContainer(this.Node);

	var options=[];

	for(var code in DbEnums[VARIANT]) {
		options.push({
			Value: code,
			Label: DbEnums[VARIANT][code].Description
		});
	}

	this.SelectorFilterVariant=new SelectorButton(this.ContainerVariant.InputInner, options, true);
	this.SelectorFilterVariant.Value.Set(null);

	this.SelectorFilterVariant.SelectionChanged.AddHandler(this, function(data, sender) {
		this.filters["variant"]=sender.Value.Get();
		this.update();
	});

	//time format

	this.ContainerFormat=new LabelAndInputContainer(this.Node);

	this.DropDownFilterTimeControl=new DropDown(this.ContainerFormat.InputInner);
	this.DropDownFilterTimeControl.Add(null, "All formats");

	var formats=[
		GAME_FORMAT_BULLET,
		GAME_FORMAT_BLITZ,
		GAME_FORMAT_QUICK,
		GAME_FORMAT_STANDARD,
		GAME_FORMAT_CORRESPONDENCE
	];

	for(var i=0; i<formats.length; i++) {
		this.DropDownFilterTimeControl.Add(formats[i], DbEnums[GAME_FORMAT][formats[i]].Description);
	}

	this.DropDownFilterTimeControl.SelectionChanged.AddHandler(this, function(data, sender) {
		this.filters["format"]=data.NewValue;
		this.update();
	});

	//rated

	this.ContainerRated=new LabelAndInputContainer(this.Node);

	this.SelectorFilterRated=new SelectorButton(this.ContainerRated.InputInner, [
		{
			Value: true,
			Label: "Rated"
		},
		{
			Value: false,
			Label: "Unrated"
		}
	], true);

	this.SelectorFilterRated.Value.Set(null);

	this.SelectorFilterRated.SelectionChanged.AddHandler(this, function(data, sender) {
		this.filters["rated"]=sender.Value.Get();
		this.update();
	});

	//colour

	this.ContainerColour=new LabelAndInputContainer(this.Node);

	this.SelectorFilterColour=new SelectorButton(this.ContainerColour.InputInner, [
		{
			Value: WHITE,
			Label: "White"
		},
		{
			Value: BLACK,
			Label: "Black"
		}
	], true);

	this.SelectorFilterColour.Value.Set(null);

	this.SelectorFilterColour.SelectionChanged.AddHandler(this, function(data, sender) {
		this.filters["colour"]=sender.Value.Get();
		this.update();
	});

	//rating min

	this.ContainerRatingMin=new LabelAndInputContainer(this.Node, {
		LabelPadding: 7
	});

	Dom.Style(this.ContainerRatingMin.Node, {
		marginLeft: 7
	});

	this.ContainerRatingMin.Label.Text.Set("Rating min.");

	this.TextBoxFilterRatingMin=new TextBox(this.ContainerRatingMin.InputInner);
	this.TextBoxFilterRatingMin.Width.Set(45);

	this.TextBoxFilterRatingMin.TextChanged.AddHandler(this, function(data, sender) {
		var filter=null;
		var value=sender.Value.Get();

		if(value.length>0) {
			filter=value;
		}

		this.filters["rating_min"]=filter;
		this.update();
	});

	//rating max

	this.ContainerRatingMax=new LabelAndInputContainer(this.Node, {
		LabelPadding: 7
	});

	Dom.Style(this.ContainerRatingMax.Node, {
		marginLeft: 7
	});

	this.ContainerRatingMax.Label.Text.Set("Rating max.");

	this.TextBoxFilterRatingMax=new TextBox(this.ContainerRatingMax.InputInner);
	this.TextBoxFilterRatingMax.Width.Set(45);

	this.TextBoxFilterRatingMax.TextChanged.AddHandler(this, function(data, sender) {
		var filter=null;
		var value=sender.Value.Get();

		if(value.length>0) {
			filter=value;
		}

		this.filters["rating_max"]=filter;
		this.update();
	});
}

TableFilter.prototype.update=function() {
	this.Update.Fire();
}
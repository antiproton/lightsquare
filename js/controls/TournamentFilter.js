function TournamentFilter(parent) {
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

TournamentFilter.prototype.SetupHtml=function() {
	//filters label

	this.ContainerLabel=new LabelAndInputContainer(this.Node, {
		InputWidth: 0,
		LabelPadding: 7
	});

	Dom.Style(this.ContainerLabel.LabelInner, {
		fontWeight: "bold"
	});

	this.ContainerLabel.Label.Text.Set("Filters:");

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
}

TournamentFilter.prototype.update=function() {
	this.Update.Fire();
}
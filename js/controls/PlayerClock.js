function PlayerClock(parent) {
	Control.implement(this, parent, true);

	this.Update=new Event(this);
	this.Timeout=new Event(this);
	this.BecomeUrgent=new Event(this);
	this.BecomeNormal=new Event(this);

	this.mtime=0;
	this.urgent=false;
	this.font_family="verdana";
	this.font_size=14;
	this.colour_normal="#000000";
	this.colour_urgent="#ff0000";
	this.urgent_threshold=15; //seconds
	this.tenths_display_threshold=10; //seconds
	this.padding_top=4;
	this.display_time="";

	this.init_props();

	this.SetupHtml();
}

PlayerClock.prototype.init_props=function() {
	this.PaddingTop=new Property(this, function() {
		return this.padding_top;
	}, function(value) {
		this.padding_top=value;
		this.UpdateHtml();
	});

	this.Mtime=new Property(this, function() {
		return this.mtime;
	}, function(value) {
		this.mtime=value;
		this.UpdateTime();
	});

	this.Urgent=new Property(this, function() {
		return this.urgent;
	});

	this.FontSize=new Property(this, function() {
		return this.font_size;
	}, function(value) {
		this.font_size=value;
		this.UpdateHtml();
	});

	this.FontFamily=new Property(this, function() {
		return this.font_family;
	}, function(value) {
		this.font_family=value;
		this.UpdateHtml();
	});

	this.ColourNormal=new Property(this, function() {
		return this.colour_normal;
	}, function(value) {
		this.colour_normal=value;
		this.UpdateTime();
	});

	this.ColourUrgent=new Property(this, function() {
		return this.colour_urgent;
	}, function(value) {
		this.colour_urgent=value;
		this.UpdateTime();
	});

	this.UrgentThreshold=new Property(this, function() {
		return this.urgent_threshold;
	}, function(value) {
		this.urgent_threshold=value;
		this.UpdateTime();
	});

	this.TenthsDisplayThreshold=new Property(this, function() {
		return this.tenths_display_threshold;
	}, function(value) {
		this.tenths_display_threshold=value;
		this.UpdateTime();
	});

	this.MinSections=new Property(this, function() {
		return this.min_sections;
	}, function(value) {
		this.min_sections=value;
		this.UpdateHtml();
	});

	this.MinDigits=new Property(this, function() {
		return this.min_digits;
	}, function(value) {
		this.min_digits=value;
		this.UpdateHtml();
	});

	this.DisplayTime=new Property(this, function() {
		return this.display_time;
	});
}

PlayerClock.prototype.SetupHtml=function() {
	this.time_container=div(this.Node);
	this.UpdateHtml();
}

PlayerClock.prototype.UpdateHtml=function() {
	Dom.Style(this.time_container, {
		fontFamily: this.font_family,
		fontSize: this.font_size,
		color: this.colour_normal,
		paddingTop: this.padding_top
	});

	this.UpdateTime();

	this.UiUpdate.Fire();
}

PlayerClock.prototype.UpdateTime=function() {
	var urgent=(this.mtime>0 && this.mtime<(this.urgent_threshold*MSEC_PER_SEC));
	var display_tenths=(this.mtime<(this.tenths_display_threshold*MSEC_PER_SEC) /*&& this.mtime>0*/);

	if(urgent && !this.urgent) {
		Dom.Style(this.time_container, {
			color: this.colour_urgent
		});

		this.urgent=true;
		this.BecomeUrgent.Fire();
	}

	else if(!urgent && this.urgent) {
		Dom.Style(this.time_container, {
			color: this.colour_normal
		});

		this.urgent=false;
		this.BecomeNormal.Fire();
	}

	if(this.mtime===0) {
		this.Timeout.Fire();
	}

	this.display_time=TimeParser.GetColonDisplay(this.mtime, display_tenths);
	this.time_container.innerHTML=this.display_time;

	this.Update.Fire();
}
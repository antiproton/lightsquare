/*
time setting form
*/

/*
NOTE this passes back the style to TimeSetting which should pass it back to the LiveTable
(no more separate style dropdown on the LiveTablePanel)
*/

function TimeSettingForm(parent) {
	Control.implement(this, parent);

	this.style=TIMING_SUDDEN_DEATH;
	this.initial=0;
	this.increment=0;
	this.overtime=false;
	this.overtime_increment=0;
	this.overtime_cutoff=40;

	/*
	disable increment/overtime if not suitable for the timing style
	*/

	this.overtime_styles=[
		TIMING_SUDDEN_DEATH,
		TIMING_FISCHER,
		TIMING_FISCHER_AFTER,
		TIMING_BRONSTEIN_DELAY,
		TIMING_SIMPLE_DELAY,
	];

	this.increment_styles=[
		TIMING_SUDDEN_DEATH,
		TIMING_FISCHER,
		TIMING_FISCHER_AFTER,
		TIMING_SIMPLE_DELAY,
		TIMING_BRONSTEIN_DELAY
	];

	this.Done=new Event(this);
	this.Cancel=new Event(this);

	this.Style=new Property(this, function() {
		return this.style;
	}, function(value) {
		this.style=value;
		this.UpdateHtml();
		this.update_display();
	});

	this.Initial=new Property(this, function() {
		return this.initial;
	}, function(value) {
		this.initial=value;
		this.update_display();
	});

	this.Increment=new Property(this, function() {
		return this.increment;
	}, function(value) {
		this.increment=value;
		this.update_display();
	});

	this.Overtime=new Property(this, function() {
		return this.overtime;
	}, function(value) {
		this.overtime=value;
		this.UpdateHtml();
		this.update_display();
	});

	this.OvertimeIncrement=new Property(this, function() {
		return this.overtime_increment;
	}, function(value) {
		this.overtime_increment=value;
		this.update_display();
	});

	this.OvertimeCutoff=new Property(this, function() {
		return this.overtime_cutoff;
	}, function(value) {
		this.overtime_cutoff=value;
		this.update_display();
	});

	this.SetupHtml();
}

TimeSettingForm.prototype.SetupHtml=function() {
	var self=this;
	var tmp;

	/*
	it's in a form so that hitting enter in one of the textboxes sends the
	form submit event, and we can catch it to say we're done.
	*/

	this.form=$("*form");
	this.form.action="#";
	this.Node.appendChild(this.form);

	this.inner=div(this.form);

	var full_width="100%";

	Dom.Style(this.inner, {
		fontSize: 11
	});

	this.time_container=new Container(this.inner);

	var container;

	//initial time

	container=new LabelAndInputContainer(this.time_container.Node, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Initial time");

	this.TextBoxInitial=new TextBox(container.InputInner);
	this.TextBoxInitial.Width.Set(90);
	this.TextBoxInitial.Title.Set("Accepts units, e.g. '1d'.  Default units are minutes.");

	this.TextBoxInitial.TextChanged.AddHandler(this, function(data, sender) {
		this.initial=TimeParser.Parse(data.NewValue, "m");
	});

	//increment

	container=new LabelAndInputContainer(this.time_container.Node, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Increment");

	this.TextBoxIncrement=new TextBox(container.InputInner);
	this.TextBoxIncrement.Width.Set(90);
	this.TextBoxIncrement.Title.Set("Accepts units, e.g. '3m30'.  Default units are seconds.");

	this.TextBoxIncrement.TextChanged.AddHandler(this, function(data, sender) {
		this.increment=TimeParser.Parse(data.NewValue, "s");

		if(this.increment>0 && this.style===TIMING_SUDDEN_DEATH) {
			this.style=TIMING_FISCHER_AFTER;
			this.update_display();
		}
	});

	//style

	container=new LabelAndInputContainer(this.inner, {
		OverallWidth: full_width,
		LabelWidth: 50,
		InputWidth: 150,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Style");

	this.DropDownStyle=new DropDown(container.InputInner);

	for(var code in DbEnums[TIMING]) {
		this.DropDownStyle.Add(code, DbEnums[TIMING][code].Description);
	}

	//this.DropDownStyle.Width.Set(134);

	this.DropDownStyle.SelectionChanged.AddHandler(this, function(data, sender) {
		this.style=data.NewValue;

		if(this.style===TIMING_SUDDEN_DEATH) {
			this.increment=0;
		}

		this.UpdateHtml();
		this.update_time();
	});

	//overtime

	this.overtime_container=new Container(this.inner);

	container=new LabelAndInputContainer(this.overtime_container.Node, {
		OverallWidth: full_width,
		LabelWidth: 180,
		InputWidth: 20,
		InputAlign: RIGHT
	});

	this.CheckboxOvertime=new Checkbox(container.InputInner);

	container.Label.Text.Set("Overtime\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0");
	container.Label.For.Set(this.CheckboxOvertime.Id);

	Dom.AddClass(container.Label.Node, "noselect");

	this.CheckboxOvertime.CheckedChanged.AddHandler(this, function(data, sender) {
		this.overtime=sender.Checked.Get();
		this.UpdateHtml();
	});

	//overtime details

	//overtime increment

	this.overtime_details_container=new Container(this.overtime_container.Node);

	container=new LabelAndInputContainer(this.overtime_details_container.Node, {
		OverallWidth: full_width,
		LabelWidth: 150,
		InputWidth: 50,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Overtime increment");

	this.TextBoxOvertimeIncrement=new TextBox(container.InputInner);
	this.TextBoxOvertimeIncrement.Width.Set(40);
	this.TextBoxOvertimeIncrement.Title.Set("Accepts units, e.g. '2 Hrs, 30min'.  Default units are minutes.");

	this.TextBoxOvertimeIncrement.TextChanged.AddHandler(this, function(data, sender) {
		this.overtime_increment=TimeParser.Parse(data.NewValue);
	});

	//overtime cutoff

	container=new LabelAndInputContainer(this.overtime_details_container.Node, {
		OverallWidth: full_width,
		LabelWidth: 150,
		InputWidth: 50,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Moves before overtime");

	this.TextBoxOvertimeCutoff=new TextBox(container.InputInner);
	this.TextBoxOvertimeCutoff.Width.Set(40);

	this.TextBoxOvertimeCutoff.TextChanged.AddHandler(this, function(data, sender) {
		var n=parseInt(sender.Value.Get());

		if(is_number(n) && n>0) {
			this.overtime_cutoff=n;
		}
	});

	//done

	tmp=div(this.inner);

	Dom.Style(tmp, {
		paddingTop: 3
	});

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	this.LinkCancel=new Link(container.LabelInner, "Cancel");

	Dom.Style(this.LinkCancel.Node, {
		//textDecoration: "none",
		color: "#3E84C6"
	});

	this.LinkCancel.Click.AddHandler(this, function() {
		this.Cancel.Fire();
	});

	this.ButtonDone=new Button(container.InputInner, "Done");

	this.ButtonDone.InputNode.type="submit";

	Dom.AddEventHandler(this.form, "submit", function(e) {
		if(is_function(e.preventDefault)) {
			e.preventDefault();
		}

		self.Done.Fire();

		return false; //in case this works for stopping the form and e.preventDefault doesn't
	});

	this.UpdateHtml();
	this.update_display();
}

TimeSettingForm.prototype.UpdateHtml=function() {
	var timed=(this.style!==TIMING_NONE);

	/*
	sdd is included in increment styles - if the user enters an increment of more than 0
	the style is automatically switched to FAF
	*/

	var increment_style=in_array(this.style, this.increment_styles);
	var overtime_style=in_array(this.style, this.overtime_styles);

	this.overtime_container.Display.Set(timed && overtime_style);
	this.overtime_details_container.Display.Set(this.overtime);

	this.TextBoxInitial.Enabled.Set(timed);
	this.TextBoxIncrement.Enabled.Set(timed && increment_style);
}

TimeSettingForm.prototype.update_display=function() {
	this.TextBoxInitial.Value.Set(TimeParser.Encode(this.initial, false, "m"));
	this.TextBoxIncrement.Value.Set(TimeParser.Encode(this.increment, false, "s"));
	this.DropDownStyle.Value.Set(this.style);
	this.CheckboxOvertime.Checked.Set(this.overtime);
	this.TextBoxOvertimeCutoff.Value.Set(this.overtime_cutoff);
	this.TextBoxOvertimeIncrement.Value.Set(TimeParser.Encode(this.overtime_increment, true));
}

TimeSettingForm.prototype.update_time=function() {
	this.TextBoxInitial.Value.Set(TimeParser.Encode(this.initial, false, "m"));
	this.TextBoxIncrement.Value.Set(TimeParser.Encode(this.increment, false, "s"));
}
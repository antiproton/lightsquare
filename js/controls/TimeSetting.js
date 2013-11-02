/*
Control that displays the current time settings, and if
configurable will bring up a dialog to edit them when clicked.
*/

function TimeSetting(parent) {
	Control.implement(this, parent);

	this.Changed=new Event(this);

	this.style=TIMING_SUDDEN_DEATH;
	this.initial=0;
	this.increment=0;
	this.overtime=false;
	this.overtime_cutoff=40;
	this.overtime_increment=0;
	this.configurable=true;
	this.editing=false;

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

	this.Style=new Property(this, function() {
		return this.style;
	}, function(value) {
		this.style=value;
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

	this.Configurable=new Property(this, function() {
		return this.configurable;
	}, function(value) {
		this.configurable=value;
		this.UpdateHtml();
	});

	this.Enabled=new Property(this, function() { //NOTE currently just an alias for configurable
		return this.configurable;
	}, function(value) {
		this.configurable=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

TimeSetting.prototype.SetupHtml=function() {
	var self=this;

	Dom.AddClass(this.Node, "timesetting");

	this.TimeSettingDialog=new SpeechBubbleBox(TOP, {
		Width: 220
	});

	Dom.Style(this.TimeSettingDialog.Inner, {
		padding: 5
	});

	this.TimeSettingDialog.Hide();
	this.TimeSettingForm=new TimeSettingForm(this.TimeSettingDialog.Inner);

	this.TimeSettingForm.Done.AddHandler(this, function(data, sender) {
		this.form_done();
	});

	this.TimeSettingForm.Cancel.AddHandler(this, function() {
		this.form_dismiss();
	});

	this.inner=div(this.Node);

	Dom.AddEventHandler(this.Node, "click", function() {
		Base.App.ClickedObjects.Add(self);
		self.click();
	});

	Base.App.BodyClick.AddHandler(this, function(data) {
		if(!Base.App.ClickedObjects.Contains(this.TimeSettingDialog) && !Base.App.ClickedObjects.Contains(this)) {
			this.form_dismiss();
		}
	});

	Base.App.HashChange.AddHandler(this, function() {
		this.form_dismiss();
	});

	this.UpdateHtml();
}

TimeSetting.prototype.UpdateHtml=function() {
	if(this.configurable && !this.editing) {
		Dom.AddClass(this.Node, "configurable");
	}

	else {
		Dom.RemoveClass(this.Node, "configurable");
	}

	if(this.editing) {
		Dom.AddClass(this.Node, "editing");
	}

	else {
		Dom.RemoveClass(this.Node, "editing");
	}

	this.update_display();
}

TimeSetting.prototype.update_display=function() {
	this.inner.innerHTML=ClockTimeDisplay.EncodeFull(
		this.style,
		this.initial,
		this.increment,
		this.overtime,
		this.overtime_increment,
		this.overtime_cutoff
	);
}

TimeSetting.prototype.form_show=function() {
	var os=Dom.GetOffsets(this.Node);
	var dim=[this.Node.offsetWidth, this.Node.offsetHeight];

	this.TimeSettingForm.Style.Set(this.style);
	this.TimeSettingForm.Initial.Set(this.initial);
	this.TimeSettingForm.Increment.Set(this.increment);
	this.TimeSettingForm.Overtime.Set(this.overtime);
	this.TimeSettingForm.OvertimeIncrement.Set(this.overtime_increment);
	this.TimeSettingForm.OvertimeCutoff.Set(this.overtime_cutoff);

	this.TimeSettingDialog.Show();
	this.TimeSettingDialog.SetArrowLocation(os[X]+Math.round(dim[X]/2), os[Y]+dim[Y]+5);

	if(this.style===TIMING_NONE) {
		this.TimeSettingForm.DropDownStyle.Focus();
	}

	else {
		this.TimeSettingForm.TextBoxInitial.Focus();
		this.TimeSettingForm.TextBoxInitial.Select();
	}

	this.editing=true;
	this.UpdateHtml();
}

TimeSetting.prototype.form_done=function() {
	if(this.editing) {
		this.TimeSettingDialog.Hide();

		this.style=this.TimeSettingForm.Style.Get();
		this.initial=this.TimeSettingForm.Initial.Get();

		if(in_array(this.style, this.increment_styles)) {
			this.increment=this.TimeSettingForm.Increment.Get();
		}

		else {
			this.increment=0;
		}

		if(in_array(this.style, this.overtime_styles)) {
			this.overtime=this.TimeSettingForm.Overtime.Get();
			this.overtime_increment=this.TimeSettingForm.OvertimeIncrement.Get();
			this.overtime_cutoff=this.TimeSettingForm.OvertimeCutoff.Get();
		}

		else {
			this.overtime=false;
		}

		this.editing=false;

		this.Changed.Fire();
		this.UpdateHtml();
	}
}

TimeSetting.prototype.form_dismiss=function() {
	this.TimeSettingDialog.Hide();

	this.editing=false;
	this.UpdateHtml();
}

TimeSetting.prototype.click=function() {
	if(this.editing) {
		this.form_dismiss();
	}

	else {
		if(this.configurable) {
			this.form_show();
		}
	}
}
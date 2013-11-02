function QuickChallengeForm(parent) {
	Control.implement(this, parent);

	this.width=300;
	this.padding=0;
	this.message_colour_waiting="#E4F2CB";
	this.message_colour_failure="#e4e4e4";
	this.message_colour=this.message_colour_waiting;

	this.variant=VARIANT_STANDARD;
	this.timing_initial=600;
	this.timing_increment=15;
	this.rating_min="-200";
	this.rating_max="+200";
	this.rated=true;
	this.choose_colour=false;
	this.challenge_colour=WHITE;
	this.challenge_to=null;

	this.Done=new Event(this);

	this.QuickChallenge=null;

	this.ChallengeWaiting=new Property(this, function() {
		return (this.QuickChallenge!==null && this.QuickChallenge.Waiting.Get());
	});

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

	this.Variant=new Property(this, function() {
		return this.variant;
	}, function(value) {
		this.variant=value;
		this.update_display();
	});

	this.TimingInitial=new Property(this, function() {
		return this.timing_initial;
	}, function(value) {
		this.timing_initial=value;
		this.update_display();
	});

	this.TimingIncrement=new Property(this, function() {
		return this.timing_increment;
	}, function(value) {
		this.timing_increment=value;
		this.update_display();
	});

	this.RatingMin=new Property(this, function() {
		return this.rating_min;
	}, function(value) {
		this.rating_min=value;
		this.update_display();
	});

	this.RatingMax=new Property(this, function() {
		return this.rating_max;
	}, function(value) {
		this.rating_max=value;
		this.update_display();
	});

	this.Rated=new Property(this, function() {
		return this.rated;
	}, function(value) {
		this.rated=value;
		this.update_display();
	});

	this.ChooseColour=new Property(this, function() {
		return this.choose_colour;
	}, function(value) {
		this.choose_colour=value;
		this.update_display();
	});

	this.ChallengeColour=new Property(this, function() {
		return this.challenge_colour;
	}, function(value) {
		this.challenge_colour=value;
		this.update_display();
	});

	this.ChallengeTo=new Property(this, function() {
		return this.challenge_to;
	}, function(value) {
		this.challenge_to=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

QuickChallengeForm.prototype.SetupHtml=function() {
	var self=this;
	this.main_container=div(this.Node);

	this.form=$("*form");
	this.form.action="#";
	this.main_container.appendChild(this.form);

	this.inner_container=div(this.form);

	var tmp, container;
	var full_width="100%";

	Dom.Style(this.inner_container, {
		fontSize: 11
	});

	//variant

	tmp=div(this.inner_container);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 55,
		InputWidth: 145,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Variant");

	var options=[];

	for(var code in DbEnums[VARIANT]) {
		options.push({
			Value: code,
			Label: DbEnums[VARIANT][code].Description
		});
	}

	this.SelectorVariant=new SelectorButton(container.InputInner, options);
	this.SelectorVariant.Value.Set(VARIANT_STANDARD); //TODO set it to whatever it was last time. same for the others

	this.SelectorVariant.SelectionChanged.AddHandler(this, function(data, sender) {
		this.variant=sender.Value.Get();
	});

	//time presets

	tmp=div(this.inner_container);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Time control");

	this.DropDownTimePresets=new DropDown(container.InputInner);
	this.DropDownTimePresets.Add(null, "Custom");
	this.DropDownTimePresets.Value.Set(null);

	for(var i=0; i<TimePresets.length; i++) {
		if(TimePresets[i].Style===TIMING_FISCHER_AFTER) {
			this.DropDownTimePresets.Add(i, TimePresets[i].Description);
		}
	}

	this.DropDownTimePresets.SelectionChanged.AddHandler(this, function(data, sender) {
		if(data.NewValue!==null) {
			this.TimingInitial.Set(TimePresets[data.NewValue].Initial);
			this.TimingIncrement.Set(TimePresets[data.NewValue].Increment);
		}
	});

	//initial time

	tmp=div(this.inner_container);

	container=new LabelAndInputContainer(tmp, {
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
		this.timing_initial=TimeParser.Parse(data.NewValue, "m");
		this.DropDownTimePresets.Value.Set(null);
	});

	//increment

	tmp=div(this.inner_container);

	container=new LabelAndInputContainer(tmp, {
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
		this.timing_increment=TimeParser.Parse(data.NewValue, "s");
		this.DropDownTimePresets.Value.Set(null);
	});

	//ratings

	this.ContainerRatings=new Container(this.inner_container);

	tmp=div(this.ContainerRatings.Node);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Rating min.");

	this.TextBoxRatingMin=new TextBox(container.InputInner);
	this.TextBoxRatingMin.Width.Set(50);
	this.TextBoxRatingMin.Title.Set("Enter an absolute value, or prefix with '+' or '-' to base it on your rating");

	this.TextBoxRatingMin.TextChanged.AddHandler(this, function(data, sender) {
		this.rating_min=data.NewValue;
	});

	tmp=div(this.ContainerRatings.Node);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Rating max.");

	this.TextBoxRatingMax=new TextBox(container.InputInner);
	this.TextBoxRatingMax.Width.Set(50);
	this.TextBoxRatingMin.Title.Set("Enter an absolute value, or prefix with '+' or '-' to base it on your rating");

	this.TextBoxRatingMax.TextChanged.AddHandler(this, function(data, sender) {
		this.rating_max=data.NewValue;
	});

	//rated

	tmp=div(this.inner_container);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 180,
		InputWidth: 20,
		InputAlign: RIGHT
	});

	this.CheckboxRated=new Checkbox(container.InputInner);

	container.Label.Text.Set("Rated\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0");
	container.Label.For.Set(this.CheckboxRated.Id);

	this.CheckboxRated.CheckedChanged.AddHandler(this, function(data, sender) {
		this.rated=sender.Checked.Get();

		if(this.rated) {
			this.choose_colour=false;
		}

		this.update_display();
	});

	//colour

	tmp=div(this.inner_container);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 60,
		InputWidth: 140,
		InputAlign: RIGHT
	});

	this.SelectorColour=new SelectorButton(container.InputInner, [
		{
			Value: null,
			Label: "Any"
		},
		{
			Value: WHITE,
			Label: "White"
		},
		{
			Value: BLACK,
			Label: "Black"
		}
	]);

	container.Label.Text.Set("Colour");

	this.SelectorColour.SelectionChanged.AddHandler(this, function(data, sender) {
		var value=sender.Value.Get();

		if(value===null) {
			this.choose_colour=false;
		}

		else {
			this.choose_colour=true;
			this.rated=false;
			this.challenge_colour=value;
		}

		this.update_display();
	});

	//message

	this.ContainerMessage=new Container(this.inner_container);

	Dom.Style(this.ContainerMessage.Node, {
		paddingTop: 4
	});

	this.message_box=div(this.ContainerMessage.Node);

	Dom.Style(this.message_box, {
		padding: 4,
		borderRadius: 3
	});

	this.message_inner=idiv(this.message_box);

	this.loading_gif=$("*img");
	this.message_inner.appendChild(this.loading_gif);
	this.loading_gif.src=Base.App.ImgUrl("/loading.gif");

	Dom.Style(this.loading_gif, {
		verticalAlign: "middle",
		marginRight: 5
	});

	this.LabelMessage=new Label(this.message_inner);

	//buttons

	tmp=div(this.inner_container);

	Dom.Style(tmp, {
		paddingTop: 5
	});

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 50,
		InputWidth: 150,
		InputAlign: RIGHT
	});

	this.ButtonChallenge=new Button(container.InputInner, "Start game");

	this.ButtonChallenge.InputNode.type="submit";

	Dom.AddEventHandler(this.form, "submit", function(e) {
		if(is_function(e.preventDefault)) {
			e.preventDefault();
		}

		if(self.QuickChallenge!==null && self.QuickChallenge.Waiting.Get()) {
			self.Cancel();
		}

		else {
			self.Submit();
		}

		return false; //in case this works for stopping the form and e.preventDefault doesn't
	});

	this.UpdateHtml();
}

QuickChallengeForm.prototype.UpdateHtml=function() {
	Dom.Style(this.main_container, {
		width: this.width
	});

	Dom.Style(this.inner_container, {
		padding: this.padding
	});

	Dom.Style(this.message_box, {
		backgroundColor: this.message_colour
	});

	var waiting=(this.QuickChallenge!==null && this.QuickChallenge.Waiting.Get());

	this.ButtonChallenge.Text.Set(waiting?"Cancel":"Start game");

	Dom.Style(this.loading_gif, {
		display: waiting?"":"none"
	});

	if(this.challenge_to===null) {
		this.ContainerRatings.Show();
	}

	else {
		this.ContainerRatings.Hide();
	}

	this.update_display();
}

QuickChallengeForm.prototype.Init=function() {
	this.QuickChallenge=null;
	this.DropDownTimePresets.Value.Set(null);
	this.ButtonChallenge.Enabled.Set(true);
	this.ContainerMessage.Hide();
	this.UpdateHtml();
	this.TextBoxInitial.Focus();
	this.TextBoxInitial.Select();
}

QuickChallengeForm.prototype.update_display=function() {
	this.TextBoxInitial.Value.Set(TimeParser.Encode(this.timing_initial, false, "m"));
	this.TextBoxIncrement.Value.Set(TimeParser.Encode(this.timing_increment, false, "s"));
	this.TextBoxRatingMin.Value.Set(this.rating_min);
	this.TextBoxRatingMax.Value.Set(this.rating_max);
	this.CheckboxRated.Checked.Set(this.rated);

	if(this.choose_colour) {
		this.SelectorColour.Value.Set(this.challenge_colour);
	}

	else {
		this.SelectorColour.Value.Set(null);
	}
}

QuickChallengeForm.prototype.Submit=function() {
	var self=this;
	var error=false;

	if(this.timing_initial<1) {
		alert("Initial time must be more than 0");
		error=true;
		this.TextBoxInitial.Focus();
	}

	if(!error) {
		this.QuickChallenge=new QuickChallenge(
			this.variant,
			this.timing_initial,
			this.timing_increment,
			this.rating_min,
			this.rating_max,
			this.rated,
			this.choose_colour,
			this.challenge_colour,
			this.challenge_to
		);

		this.QuickChallenge.Submit();

		this.ContainerMessage.Show();
		this.message_colour=this.message_colour_waiting;
		this.LabelMessage.Text.Set("Waiting for opponent...");
		this.UpdateHtml();

		this.QuickChallenge.Done.AddHandler(this, function(data) {
			if(data.Info===QuickChallenge.FAIL) {
				this.message_colour=this.message_colour_failure;

				if(this.QuickChallenge.ChallengeTo===null) {
					this.LabelMessage.Text.Set("No matching opponents found.");
				}

				else {
					this.LabelMessage.Text.Set(this.challenge_to+" declined your challenge.");
				}
			}

			this.Done.Fire(data);
			this.UpdateHtml();
		});
	}
}

QuickChallengeForm.prototype.Cancel=function() {
	this.ContainerMessage.Hide();

	if(this.QuickChallenge!==null) {
		this.QuickChallenge.Cancel();
	}

	this.UpdateHtml();
}
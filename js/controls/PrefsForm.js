function PrefsForm(parent) {
	Control.implement(this, parent);

	this.SetupHtml();
}

PrefsForm.prototype.SetupHtml=function() {
	var container, tmp;

	var full_width="100%";

	//appearance prefs

	this.header_appearance=div(this.Node);
	Dom.AddClass(this.header_appearance, "prefs_header");
	this.header_appearance.innerHTML="Appearance";

	this.inner_appearance=div(this.Node);

	//piece style

	tmp=div(this.inner_appearance);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 70,
		InputWidth: 130,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Piece style");
	//this.DropDownPieceStyle=new DropDown(container.InputInner);

	var pieces=[];

	for(var code in DbEnums[PIECE_STYLE]) {
		pieces.push({
			Value: code,
			Label: "<img src=\""+Base.App.ImgUrl("/board/piece/"+code+"/20/"+Fen.piece_char[Util.piece(QUEEN, BLACK)]+".png")+"\">"
		});

		//this.DropDownPieceStyle.Add(code, DbEnums[PIECE_STYLE][code].Description);
	}

	this.SelectorPieceStyle=new SelectorButton(container.InputInner, pieces);

	this.SelectorPieceStyle.SelectionChanged.AddHandler(this, function(data, sender) {
		Base.App.User.Prefs.PieceStyle.Set(sender.Value.Get());
	});

	//board size

	tmp=div(this.inner_appearance);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Board size");
	this.DropDownBoardSize=new DropDown(container.InputInner);

	var sizes=[20, 30, 45, 60, 75, 90];

	for(var i=0; i<sizes.length; i++) {
		this.DropDownBoardSize.Add(sizes[i], sizes[i]);
	}

	this.DropDownBoardSize.SelectionChanged.AddHandler(this, function(data, sender) {
		Base.App.User.Prefs.BoardSize.Set(parseInt(sender.Value.Get()));
	});

	//board style

	tmp=div(this.inner_appearance);

	container=new LabelAndInputContainer(tmp, {
		OverallWidth: full_width,
		LabelWidth: 100,
		InputWidth: 100,
		InputAlign: RIGHT
	});

	container.Label.Text.Set("Board colour");
	this.DropDownBoardColour=new DropDown(container.InputInner);

	for(var i=0; i<BoardStylePresets.length; i++) {
		this.DropDownBoardColour.Add(i, BoardStylePresets[i].Description);
	}

	this.DropDownBoardColour.SelectionChanged.AddHandler(this, function(data, sender) {
		var i=parseInt(sender.Value.Get());
		var style;

		if(i<BoardStylePresets.length) {
			style=BoardStylePresets[i];
			Base.App.User.Prefs.BoardColour.Set(style.Light, style.Dark);
		}
	});

	//show coords

	tmp=div(this.inner_appearance);
	this.CheckboxShowCoords=new Checkbox(tmp, "Show coords");

	this.CheckboxShowCoords.CheckedChanged.AddHandler(this, function(data, sender) {
		Base.App.User.Prefs.ShowCoords.Set(sender.Checked.Get());
	});

	//highlight last move

	tmp=div(this.inner_appearance);
	this.CheckboxHighlightLastMove=new Checkbox(tmp, "Highlight last move");

	this.CheckboxHighlightLastMove.CheckedChanged.AddHandler(this, function(data, sender) {
		Base.App.User.Prefs.HighlightLastMove.Set(sender.Checked.Get());
	});

	//behaviour prefs

	this.header_appearance=div(this.Node);
	Dom.AddClass(this.header_appearance, "prefs_header");
	this.header_appearance.innerHTML="Gameplay";

	Dom.Style(this.header_appearance, {
		marginTop: 5
	});

	this.inner_behaviour=div(this.Node);

	//premove

	container=div(this.inner_behaviour);
	this.CheckboxPremove=new Checkbox(container, "Premove");

	this.CheckboxPremove.CheckedChanged.AddHandler(this, function(data, sender) {
		Base.App.User.Prefs.Premove.Set(sender.Checked.Get());
	});

	//auto promote

	container=div(this.inner_behaviour);
	this.CheckboxAutoQueen=new Checkbox(container, "Always queen");

	this.CheckboxAutoQueen.CheckedChanged.AddHandler(this, function(data, sender) {
		Base.App.User.Prefs.AutoQueen.Set(sender.Checked.Get());
	});

	//container.Label.For.Set(this.CheckboxPremove.Id);

	this.Init();
}

PrefsForm.prototype.Init=function() {
	var prefs=Base.App.User.Prefs;

	this.SelectorPieceStyle.Value.Set(prefs.PieceStyle.Get());
	this.DropDownBoardSize.Value.Set(prefs.BoardSize.Get());

	var style;

	for(var i=0; i<BoardStylePresets.length; i++) {
		style=BoardStylePresets[i];

		if(prefs.BoardColourLight.Get()===style.Light && prefs.BoardColourDark.Get()===style.Dark) {
			this.DropDownBoardColour.Value.Set(i);

			break;
		}
	}

	this.CheckboxShowCoords.Checked.Set(prefs.ShowCoords.Get());
	this.CheckboxHighlightLastMove.Checked.Set(prefs.HighlightLastMove.Get());
	this.CheckboxPremove.Checked.Set(prefs.Premove.Get());
	this.CheckboxAutoQueen.Checked.Set(prefs.AutoQueen.Get());
}
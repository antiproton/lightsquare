function OptionsPanel(parent) {
	Panel.implement(this, parent);

	this.load_prefs();

	Base.App.User.Prefs.PrefsChanged.AddHandler(this, function() {
		this.load_prefs();
	});
}

OptionsPanel.prototype.SetupHtml=function() {
	Panel.prototype.SetupHtml.call(this);

	var container;

	var def_dd_lbl_w=75;

	container=div(this.inner);
	this.CheckboxLastMove=new Checkbox(container, "Highlight last move");

	//TODO implement commented ones
	//and add board colour options
	//container=div(this.inner);
	//this.CheckboxPossibleMoves=new Checkbox(container, "Show possible moves");
	//
	//container=div(this.inner);
	//this.CheckboxSound=new Checkbox(container, "Sound");
	//
	//container=div(this.inner);
	//this.CheckboxAnimation=new Checkbox(container, "Animate moves");

	container=div(this.inner);
	this.CheckboxShowCoords=new Checkbox(container, "Show coords");

	//container=div(this.inner);
	//this.DropDownBoardStyle=new DropDown(container, "Board", def_dd_lbl_w);

	container=div(this.inner);
	this.DropDownSize=new DropDown(container, "Size", def_dd_lbl_w);

	for(var size=30; size<=90; size+=15) {
		this.DropDownSize.Add(size, size);
	}

	container=div(this.inner);
	this.DropDownPieceStyle=new DropDown(container, "Pieces", def_dd_lbl_w);

	for(var code in DbEnums[PIECE_STYLE]) {
		this.DropDownPieceStyle.Add(code, DbEnums[PIECE_STYLE][code].Description);
	}

	container=div(this.inner);
	this.ButtonSaveConfig=new Button(container, "Save");

	this.ButtonSaveConfig.Click.AddHandler(this, function() {
		Xhr.RunQueryAsync(ap("/xhr/save_prefs.php"), {
			"highlight_last_move": this.CheckboxLastMove.Checked.Get(),
			"show_coords": this.CheckboxShowCoords.Checked.Get(),
			"board_size": this.DropDownSize.Value.Get(),
			"piece_style": this.DropDownPieceStyle.Value.Get()
		});
	});
}

OptionsPanel.prototype.load_prefs=function() {
	this.CheckboxLastMove.Checked.Set(Base.App.User.Prefs.HighlightLastMove.Get());
	//this.CheckboxPossibleMoves.Checked.Set(Base.App.User.Prefs.HighlightPossibleMoves.Get());
	//this.CheckboxSound.Checked.Set(Base.App.User.Prefs.Sound.Get());
	//this.CheckboxAnimation.Checked.Set(Base.App.User.Prefs.AnimateMoves.Get());
	this.CheckboxShowCoords.Checked.Set(Base.App.User.Prefs.ShowCoords.Get());
	this.DropDownSize.Value.Set(Base.App.User.Prefs.BoardSize.Get());
	this.DropDownPieceStyle.Value.Set(Base.App.User.Prefs.PieceStyle.Get());
}
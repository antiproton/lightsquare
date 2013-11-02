function HistoryControls(parent) {
	Control.implement(this, parent);

	this.History=null;
	this.img_dir="/img/buttons";

	this.width=100;

	this.Width=new Property(this, function() {
		return this.width;
	}, function(value) {
		this.width=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

HistoryControls.prototype.SetupHtml=function() {
	this.inner=div(this.Node);

	//this.ButtonFirst=new Button(tmpdiv, "|<");
	//this.ButtonPrevFive=new Button(tmpdiv, "<<");
	//this.ButtonPrev=new Button(tmpdiv, "<");
	//this.ButtonNext=new Button(tmpdiv, ">");
	//this.ButtonNextFive=new Button(tmpdiv, ">>");
	//this.ButtonLast=new Button(tmpdiv, ">|");

	Dom.AddClass(this.inner, "hist_ctrl_buttons");

	this.ButtonFirst=new SpriteButton(this.inner, 23, 20, this.img_dir+"/hist_ctrl_first.png");
	this.ButtonPrevFive=new SpriteButton(this.inner, 23, 20, this.img_dir+"/hist_ctrl_prev5.png");
	this.ButtonPrev=new SpriteButton(this.inner, 23, 20, this.img_dir+"/hist_ctrl_prev.png");
	this.ButtonNext=new SpriteButton(this.inner, 23, 20, this.img_dir+"/hist_ctrl_next.png");
	this.ButtonNextFive=new SpriteButton(this.inner, 23, 20, this.img_dir+"/hist_ctrl_next5.png");
	this.ButtonLast=new SpriteButton(this.inner, 23, 20, this.img_dir+"/hist_ctrl_last.png");

	this.ButtonFirst.Click.AddHandler(this, function() {
		if(this.History!==null) {
			if(this.History.SelectedMove===null && this.History.MainLine.Line.Length>0) {
				this.History.Select(this.History.MainLine.FirstMove);
			}

			else {
				this.History.Select(null);
			}
		}
	});

	this.ButtonPrevFive.Click.AddHandler(this, function() {
		if(this.History!==null) {
			if(this.History.MainLine.Line.Length>0) {
				for(var i=0; i<5; i++) {
					if(this.History.SelectedMove!==null && this.History.SelectedMove.PreviousMove!==null) {
						this.History.Select(this.History.SelectedMove.PreviousMove);
					}

					else if(this.History.SelectedMove!==null && this.History.SelectedMove.Variation!==this.History.MainLine) {
						this.History.Select(this.History.SelectedMove.Variation.BranchMove);

						break;
					}

					else {
						this.History.Select(null);

						break;
					}
				}
			}
		}
	});

	this.ButtonPrev.Click.AddHandler(this, function() {
		if(this.History!==null) {
			if(this.History.SelectedMove!==null && this.History.SelectedMove.PreviousMove!==null) {
				this.History.Select(this.History.SelectedMove.PreviousMove);
			}

			else if(this.History.SelectedMove!==null && this.History.SelectedMove.Variation!==this.History.MainLine) {
				this.History.Select(this.History.SelectedMove.Variation.BranchMove);
			}

			else {
				this.History.Select(null);
			}
		}
	});

	this.ButtonNext.Click.AddHandler(this, function() {
		if(this.History!==null) {
			if(this.History.SelectedMove===null) {
				if(this.History.MainLine.Line.Length>0) {
					this.History.Select(this.History.MainLine.FirstMove);
				}
			}

			else if(this.History.SelectedMove.NextMove!==null) {
				this.History.Select(this.History.SelectedMove.NextMove);
			}
		}
	});

	this.ButtonNextFive.Click.AddHandler(this, function() {
		if(this.History!==null) {
			if(this.History.SelectedMove===null) {
				if(this.History.MainLine.Line.Length>0) {
					this.History.Select(this.History.MainLine.FirstMove);
				}
			}

			if(this.History.SelectedMove!==null) {
				var i=0;

				while(i<5 && this.History.SelectedMove.NextMove!==null) {
					this.History.Select(this.History.SelectedMove.NextMove);
					i++;
				}
			}
		}
	});

	this.ButtonLast.Click.AddHandler(this, function() {
		if(this.History!==null) {
			if(this.History.MainLine.LastMove!==null) {
				this.History.Select(this.History.MainLine.LastMove);
			}
		}
	});
}

HistoryControls.prototype.UpdateHtml=function() {
	Dom.Style(this.inner, {
		width: this.width
	});
}
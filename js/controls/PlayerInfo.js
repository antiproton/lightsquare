function PlayerInfo(parent, game_id, show_sit_button) {
	Control.implement(this, parent);

	this.show_sit_button=show_sit_button||false;
	this.username=null;
	this.rating=0;
	this.score=0;
	this.show_score=false;
	this.has_rating=false;
	this.colour=WHITE;
	this.game_id=game_id;
	this.height=26;
	this.padding_top=4;
	this.img_dir_icons="/img/icon/colour_dot";
	this.font_size=16;

	this.GameId=new Property(this, function() {
		return this.game_id;
	}, function(value) {
		this.game_id=value;
	});;

	this.FontSize=new Property(this, function() {
		return this.font_size;
	}, function(value) {
		this.font_size=value;
		this.UpdateHtml();
	});

	this.ImgDirIcons=new Property(this, function() {
		return this.img_dir_icons;
	}, function(value) {
		this.img_dir_icons=value;
		this.UpdateHtml();
	});

	this.Height=new Property(this, function() {
		return this.height;
	}, function(value) {
		this.height=value;
		this.UpdateHtml();
	});

	this.PaddingTop=new Property(this, function() {
		return this.padding_top;
	}, function(value) {
		this.padding_top=value;
		this.UpdateHtml();
	});

	this.Sit=new Event(this);

	this.Colour=new Property(this, function() {
		return this.colour;
	}, function(value) {
		this.colour=value;
		this.UpdateHtml();
	});

	this.Username=new Property(this, function() {
		return this.username;
	}, function(value) {
		if(value!==this.username) {
			this.username=value;
			this.has_rating=false;
			this.UpdateHtml();
		}
	});

	this.Rating=new Property(this, function() {
		return this.rating;
	}, function(value) {
		if(value!==null && value>0) {
			this.rating=value;
			this.has_rating=true;
		}

		else {
			this.rating=null;
			this.has_rating=false;
		}

		this.UpdateHtml();
	});

	this.Score=new Property(this, function() {
		return this.score;
	}, function(value) {
		this.score=value;
		this.UpdateHtml();
	});

	this.ShowScore=new Property(this, function() {
		return this.show_score;
	}, function(value) {
		this.show_score=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

PlayerInfo.prototype.SetupHtml=function() {
	var self=this;
	this.inner=div(this.Node);

	//there are 2 possible things to show - sit button or username of person in seat

	this.inner_open=div(this.inner);
	this.inner_taken=div(this.inner);

	//Sit button

	this.colour_icon=$("*img");
	this.inner_open.appendChild(this.colour_icon);
	this.ButtonSit=new Button(this.inner_open, "Sit");

	this.ButtonSit.Click.AddHandler(this, function() {
		this.Sit.Fire();
	});

	//username

	this.user_link=$("*span"); //NOTE make it *a when user profiles are done
	this.inner_taken.appendChild(this.user_link);
	this.user_link.target="_blank";

	this.rating_span=$("*span");
	this.inner_taken.appendChild(this.rating_span);

	this.score_span=$("*span");
	this.inner_taken.appendChild(this.score_span);

	this.UpdateHtml();
}

PlayerInfo.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		height: this.height
	});

	Dom.Style(this.inner_open, {
		display: "none"
	});

	Dom.Style(this.inner_taken, {
		display: "none"
	});

	if(this.username===null && this.show_sit_button) {
		Dom.Style(this.inner_open, {
			display: ""
		});

		this.colour_icon.src=ap(this.img_dir_icons+"/"+Util.colour_name(this.colour)+".png");

		Dom.Style(this.colour_icon, {
			verticalAlign: "middle",
			marginRight: 8
		});
	}

	else if(this.username!==null) {
		Dom.Style(this.inner_taken, {
			display: ""
		});

		Dom.Style(this.inner_taken, {
			paddingTop: this.padding_top
		});

		Dom.Style(this.user_link, {
			fontSize: this.font_size,
			color: "#343434"
		});

		//this.user_link.href=ap("/user/profile?user="+this.username); //NOTE commented out cos user profiles not done yet
		this.user_link.innerHTML=this.username;

		if(this.has_rating) {
			this.rating_span.innerHTML=" ("+this.rating+")";
		}

		else {
			this.rating_span.innerHTML="";
		}

		if(this.show_score) {
			this.score_span.innerHTML=" ["+this.score.toFixed(1)+"]";
		}

		else {
			this.score_span.innerHTML="";
		}
	}
}

PlayerInfo.prototype.LoadRating=function(type, variant, format) {
	if(this.username!==null) {
		Xhr.GetAsync(ap("/xhr/get_rating.php"), function(response) {
			var data=Data.Unserialise(response);

			if(data===false) {
				this.Rating.Set(null);
			}

			else {
				this.Rating.Set(data);
			}
		}, {
			"q": Data.Serialise({
				"user": this.username,
				"type": type,
				"variant": variant,
				"format": format
			})
		}, this);
	}
}
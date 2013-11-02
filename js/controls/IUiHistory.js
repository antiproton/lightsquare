function IUiHistory(parent) {
	Control.implement(this, parent);
	IHistoryCommon.implement(this);

	this.UserSelect=new Event(this);

	this.width=300;
	this.height=120;
	this.border_width=1;
	this.border_style="solid";
	this.border_color="#a5a5a5";
	this.background_colour="#ffffff";
	this.padding=8;
	this.font_size=12;

	this.init_props();

	this.SetupHtml();
}

IUiHistory.prototype.init_props=function() {
	this.FontSize=new Property(this, function() {
		return this.font_size;
	}, function(value) {
		this.font_size=value;
		this.UpdateHtml();
	});

	this.BackgroundColour=new Property(this, function() {
		return this.background_colour;
	}, function(value) {
		this.background_colour=value;
		this.UpdateHtml();
	});

	this.Height=new Property(this, function() {
		return this.height;
	}, function(value) {
		this.height=value;
		this.UpdateHtml();
	});

	this.Width=new Property(this, function() {
		return this.width;
	}, function(value) {
		this.width=value;
		this.UpdateHtml();
	});

	this.BorderWidth=new Property(this, function() {
		return this.border_width;
	}, function(value) {
		this.border_width=value;
		this.UpdateHtml();
	});

	this.BorderStyle=new Property(this, function() {
		return this.border_style;
	}, function(value) {
		this.border_style=value;
		this.UpdateHtml();
	});

	this.BorderColor=new Property(this, function() {
		return this.border_color;
	}, function(value) {
		this.border_color=value;
		this.UpdateHtml();
	});

	this.Padding=new Property(this, function() {
		return this.padding;
	}, function(value) {
		this.padding=value;
		this.UpdateHtml();
	});
}

IUiHistory.prototype.SetupHtml=function() {
	this.inner_container=div(this.Node); //border, padding
	this.root_variation_container=div(this.inner_container);
	this.root_variation_container.appendChild(this.MainLine.Node);

	Dom.Style(this.inner_container, {
		overflowY: "scroll"
	});

	this.MainLine.SetupHtml();
	this.UpdateHtml();
}

IUiHistory.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		fontSize: this.font_size,
		width: this.width,
		backgroundColor: this.background_colour
	});

	Dom.Style(this.inner_container, {
		height: this.height,
		borderWidth: this.border_width,
		borderStyle: this.border_style,
		borderColor: this.border_color
	});

	Dom.Style(this.root_variation_container, {
		padding: this.padding
	});
}

IUiHistory.prototype.Select=function(move) {
	IHistoryCommon.prototype.Select.call(this, move);

	if(move!==null) {
		move.Select();

		/*
		make sure the move is in view if the history has a scrollbar
		*/

		var node=this.inner_container;

		if(move===this.MainLine.LastMove) { //we can safely just scroll to the bottom
			node.scrollTop=node.scrollHeight;
		}

		else { //requires a bunch of calculations
			var scroll_top=node.scrollTop;
			var window_height=node.offsetHeight;
			var os=Dom.GetOffset(move.Node, Y)-Dom.GetOffset(node, Y);
			var move_height=move.NodeHeight.Get();
			var os_bottom=os+move_height;
			var window_bottom=scroll_top+window_height;

			if(os_bottom>window_bottom) {
				node.scrollTop=(os-(window_height-move_height))+this.padding;
			}

			else if(os<scroll_top) {
				node.scrollTop=os-this.padding;
			}
		}
	}
}

IUiHistory.prototype.deselect=function() {
	if(this.SelectedMove!==null) {
		this.SelectedMove.Deselect();
	}

	IHistoryCommon.prototype.deselect.call(this);
}

IUiHistory.prototype.get_new_variation=function(is_mainline) {
	return new UiVariation(this, is_mainline);
}
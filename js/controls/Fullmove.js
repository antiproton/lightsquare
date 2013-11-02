function Fullmove(parent, fullmove) {
	Control.implement(this, parent);

	this.Fullmove=fullmove;

	this.moves_added=[
		false,
		false
	];

	this.MoveAdded=new Property(this, function(colour) {
		return this.moves_added[colour];
	});

	this.background_colour="#ffffff";

	this.BackgroundColour=new Property(this, function() {
		return this.background_colour;
	}, function(value) {
		this.background_colour=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

Fullmove.prototype.SetupHtml=function() {
	Dom.Style(this.Node, {
		padding: 4
	});

	this.fullmove_col=div(this.Node);

	Dom.Style(this.fullmove_col, {
		cssFloat: "left",
		width: "20%"
	});

	this.fullmove_col.appendChild($("%"+this.Fullmove+"."));

	//Dom.Style(this.fullmove_col, {
	//	fontSize: 11,
	//	color: "#323232"
	//});

	this.colour_cols=[
		div(this.Node),
		div(this.Node)
	];

	for(var i=0; i<this.colour_cols.length; i++) {
		Dom.Style(this.colour_cols[i], {
			cssFloat: "left",
			width: "40%"
		});
	}

	var cb=div(this.Node);

	Dom.Style(cb, {
		clear: "both"
	});

	this.UpdateHtml();
}

Fullmove.prototype.UpdateHtml=function() {
	Dom.Style(this.Node, {
		backgroundColor: this.background_colour
	});
}

Fullmove.prototype.Add=function(move) {
	this.colour_cols[move.Colour].appendChild(move.Node);
	move.SetupHtml();
	move.ParentFullmove=this;
	this.moves_added[move.Colour]=true;
}

Fullmove.prototype.Remove=function(move) {
	Dom.RemoveNode(move.Node);
	this.moves_added[move.Colour]=false;
}

Fullmove.prototype.IsEmpty=function() {
	return (this.moves_added[WHITE]===false && this.moves_added[BLACK]===false);
}
function TableListItem(data) {
	this.Node=$("*div");
	this.Data=data;
}

TableListItem.prototype.SetupHtml=function() {
	this.inner=div(this.Node);

	this.Cells={
		Type: this.create_cell_div("12%", 4),
		Variant: this.create_cell_div("12%"),
		Time: this.create_cell_div("12%"),
		Rated: this.create_cell_div("12%"),
		Opponent: this.create_cell_div("15%"),
		OppRating: this.create_cell_div("12%"),
		Action: this.create_cell_div("25%")
	};

	var cb=div(this.inner);

	Dom.Style(cb, {
		clear: "both"
	});

	this.Cells.Type.Inner.appendChild($("%"+DbEnums[GAME_TYPE][this.Data["type"]].Description));

	//...

	this.ButtonJoinWhite=new Button(this.Cells.Action.Inner, "Join");
	this.ButtonJoinBlack=new Button(this.Cells.Action.Inner, "Join");
	this.ButtonJoinRandom=new Button(this.Cells.Action.Inner, "Join");
}

/*
helper for SetupHtml
*/

TableListItem.prototype.create_cell_div=function(width, padding) {
	padding=padding||0;
	var cell={};

	cell.Container=div(this.inner);
	cell.Inner=div(cell.Container);

	Dom.Style(cell.Container, {
		cssFloat: "left",
		width: width
	});

	Dom.Style(cell.Inner, {
		padding: padding
	});

	return cell;
}
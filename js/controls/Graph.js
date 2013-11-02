/*
TODO - quick challenge graph

make as much generic as possible, other types of graph may be useful
*/

function Graph(parent) {
	Control.implement(this, parent);

	this.SetupHtml();
}

Graph.prototype.SetupHtml=function() {
/*	Dom.Style(this.Node, {
		position: "absolute",
		width: "100%"
	})*/;

	this.inner=div(this.Node);

	Dom.Style(this.inner, {
		position: "absolute",
		width: "100px",
		height: "30px",
		backgroundColor: "#234"
	});

	this.UpdateHtml();
}

Graph.prototype.UpdateHtml=function() {

}

Graph.prototype.Update=function(data) {

}
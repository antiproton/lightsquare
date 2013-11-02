function ResultDisplay(parent) {
	Control.implement(this, parent);

	this.SetupHtml();
}

ResultDisplay.prototype.SetupHtml=function() {
	Dom.Style(this.Node, {
		fontWeight: "bold",
		fontSize: 11,
		//color: "#ffffff",
		//display: "inline-block",
		marginTop: 2,
		//marginBottom: 2,
		borderStyle: "solid",
		borderWidth: 0,
		borderColor: "",
		//borderRadius: 3,
		padding: "2px 4px 2px 4px",
		//backgroundColor: "#2e7ecf"
	});
}

ResultDisplay.prototype.SetResult=function(result, result_details) {
	this.Node.innerHTML=Result.String[result];
}

//ResultDisplay.prototype.Show=function() {
//	Dom.Style(this.Node, {
//		display: "inline-block"
//	});
//}
//
//ResultDisplay.prototype.Hide=function() {
//	Dom.Style(this.Node, {
//		display: "none"
//	});
//}
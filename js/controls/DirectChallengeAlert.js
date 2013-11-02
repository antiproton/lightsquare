function DirectChallengeAlert(parent, data) {
	Control.implement(this, parent);

	var self=this;

	this.challenge_data=data;
	this.SetupHtml();

	/*
	make sure the alert disappears if the challenge is no longer active

	(the -1 second is so to account for the time the challenge took to arrive
	to the user)

	while_challenge_exists just sleeps while the challenge is still there and
	open.
	*/

	setTimeout(function() {
		self.Hide();
	}, (QUICK_CHALLENGE_SEEK_TIMEOUT-1)*MSEC_PER_SEC);

	Xhr.QueryAsync(ap("/xhr/while_challenge_exists.php"), function() {
		this.Hide();
	}, {
		"id": this.challenge_data["id"]
	}, this);
}

DirectChallengeAlert.prototype.SetupHtml=function() {
	var self=this;

	Dom.AddClass(this.Node, "alert");

	this.inner=div(this.Node);

	Dom.AddClass(this.inner, "inner");

	var row=this.challenge_data;

	this.inner.innerHTML=""
		+row["owner"]+" has challenged you to a game ("+DbEnums[VARIANT][row["variant"]].Description
		+" "+ClockTimeDisplay.Encode(TIMING_FISCHER_AFTER, row["timing_initial"], row["timing_increment"])
		+" "+(row["rated"]?"rated":"unrated")
		+"; you play "+(row["choose_colour"]?Util.colour_name(Util.opp_colour(row["challenge_colour"])):"random"+")")
		+"<br><br>";

	var link_accept=$("*a");
	this.inner.appendChild(link_accept);

	this.inner.appendChild($("% | "));

	var link_decline=$("*a");
	this.inner.appendChild(link_decline);

	link_accept.href="javascript:void(0)";
	link_accept.innerHTML="Accept";

	Dom.AddEventHandler(link_accept, "click", function() {
		QuickChallenge.Accept(row["id"], function(response) {
			this.Hide();

			if(response!==false) {
				Base.App.OpenTable(row["id"]);
			}

			else {
				this.Show();

				this.Node.innerHTML=""
					+"There was an error while accepting the challenge."
					+"  Most likely the other player cancelled it before"
					+" the request completed.";

				setTimeout(function() {
					self.Hide();
				}, 3000);
			}
		}, this);
	}, this);

	link_decline.href="javascript:void(0)";
	link_decline.innerHTML="Decline";

	Dom.AddEventHandler(link_decline, "click", function() {
		QuickChallenge.Decline(row["id"]);
		this.Hide();
	}, this);
}
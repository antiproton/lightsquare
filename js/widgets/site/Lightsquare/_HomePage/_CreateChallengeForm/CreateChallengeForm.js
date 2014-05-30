define(function(require) {
	require("css!./create_challenge_form.css");
	var html = require("file!./create_challenge_form.html");
	var Ractive = require("lib/dom/Ractive");
	var jsonChessConstants = require("jsonchess/constants");
	
	function CreateChallengeForm(user, parent) {
		var template = new Ractive({
			el: parent,
			template: html,
			data: {
				waiting: false,
				initialTime: "10m",
				timeIncrement: "5",
				ratingMin: "-100",
				ratingMax: "+100"
			}
		});
		
		var waitingTimer = null;
		
		template.on("create_or_cancel", function(event) {
			event.original.preventDefault();
			
			if(template.get("waiting")) {
				user.cancelChallenge();
				template.set("waiting", false);
				clearTimeout(waitingTimer);
			}
			
			else {
				user.createChallenge({
					initialTime: template.get("initialTime").toString(),
					timeIncrement: template.get("timeIncrement").toString(),
					acceptRatingMin: template.get("ratingMin").toString(),
					acceptRatingMax: template.get("ratingMax").toString()
				});
				
				template.set("waiting", true);
				
				waitingTimer = setTimeout(function() {
					template.set("waiting", false);
				}, jsonChessConstants.CHALLENGE_TIMEOUT);
			}
		});
	}
	
	return CreateChallengeForm;
});
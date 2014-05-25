define(function(require) {
	var html = require("file!./create_challenge_form.html");
	var Ractive = require("lib/dom/Ractive");
	
	function CreateChallengeForm(user, parent) {
		var template = new Ractive({
			el: parent,
			template: html,
			data: {
				initialTime: "10m",
				timeIncrement: "5",
				ratingMin: "-100",
				ratingMax: "+100"
			}
		});
		
		template.on("submit", function(event) {
			event.original.preventDefault();
			
			user.createChallenge({
				initialTime: template.get("initialTime").toString(),
				timeIncrement: template.get("timeIncrement").toString(),
				acceptRatingMin: template.get("ratingMin").toString(),
				acceptRatingMax: template.get("ratingMax").toString()
			});
		});
	}
	
	return CreateChallengeForm;
});




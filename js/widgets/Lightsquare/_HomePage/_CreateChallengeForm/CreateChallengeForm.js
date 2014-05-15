define(function(require) {
	var html = require("file!./create_challenge_form.html");
	var Ractive = require("lib/dom/Ractive");
	
	function CreateChallengeForm(app, user, parent) {
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
		
		template.on("submit", function(event, initialTime, timeIncrement, ratingMin, ratingMax) {
			event.original.preventDefault();
			
			user.createChallenge({
				initialTime: initialTime,
				timeIncrement: timeIncrement,
				acceptRatingMin: ratingMin,
				acceptRatingMax: ratingMax
			});
		});
	}
	
	return CreateChallengeForm;
});




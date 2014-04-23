define(function(require) {
	var Glicko = require("chess/Glicko");
	var Publisher = require("lib/Publisher");
	
	function User(client) {
		this._client = client;
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._gamesPlayedAsWhite = 0;
		this._gamesPlayedAsBlack = 0;
		this._rating = Glicko.INITIAL_RATING;
		
		this.Replaced = new Event(this);
		this.LoggedIn = new Event(this);
		this.LoggedOut = new Event(this);
		
		this._publisher = new Publisher();
		
		this._client.subscribe("*", (function(url, data) {
			this._publisher.publish(url, data);
		}).bind(this));
		
		this._client.subscribe("/user/login/success", (function(data) {
			console.log("logged in");
			console.log(data);
		}).bind(this));
	}
	
	return User;
});
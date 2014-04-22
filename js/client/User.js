define(function(require) {
	var Glicko = require("chess/Glicko");
	
	function User(server) {
		this._server = server;
		this._username = "Anonymous";
		this._isLoggedIn = false;
		this._gamesPlayedAsWhite = 0;
		this._gamesPlayedAsBlack = 0;
		this._rating = Glicko.INITIAL_RATING;
		
		this.Replaced = new Event(this);
		this.LoggedIn = new Event(this);
		this.LoggedOut = new Event(this);
		
		this._server.subscribe("/user/login/success", (function(data) {
			console.log("logged in");
			console.log(data);
		}).bind(this));
	}
	
	return User;
});
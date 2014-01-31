define(function(require) {
	var Publisher=require("lib/Publisher");
	require("lib/Array.remove");
	var User=require("./User");
	
	function Application(server) {
		this._server=server;
		this._tables=[];
		this._openChallenges=[];
		this._publisher=new Publisher();
		
		server.ClientConnected.addHandler(this, function(data) {
			var client=data.client;
			var user=new User(client);
			
			user.subscribe("/disconnected", (function() {
				this._sendBroadcastMessage("/user_disconnected", user.getId());
			}).bind(this));
			
			user.subscribe("/create_challenge", (function(data) {
				this._createChallenge(user, data);
			}).bind(this));
			
			user.sendCurrentTables(this._tables);
			user.send("/challenges", this._openChallenges);
			this._sendBroadcastMessage("/user_connected", user.id);
		});
	}
	
	Application.prototype._createChallenge=function(owner, options) {
		var challenge=new Challenge(owner, options);
		
		this._openChallenges[challenge.getId()]=challenge;
		this._sendBroadcastMessage("/challenges", [challenge]);
	}
	
	Application.prototype._sendBroadcastMessage=function(data) {
		this._server.sendBroadcastMessage(data);
	}
	
	return Application;
});
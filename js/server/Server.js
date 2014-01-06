define(function(require) {
	var Event=require("lib/Event");
	var WsServer=require("websocket").server;
	var http=require("http");

	function Server(port) {
		ServerStackLayer.call(this);

		this._port=port||Server.DEFAULT_PORT;
		this._clientsBySessionCookie={};
	}

	Server.DEFAULT_PORT=8080;

	Server.prototype.run=function() {
		var httpServer=http.createServer(function(request, response) {
			response.writeHead(404);
			response.end();
		});

		httpServer.listen(this._port);

		wsServer=new WsServer({
			httpServer: httpServer
		});

		wsServer.on("request", function(request) {
			var cookies={};

			for(var i=0; i<request.cookies.length; i++) {
				cookies[request.cookies[i].name]=request.cookies[i].value;
			}
	
			if("session" in cookies) {
				var sessionId=cookies["session"];
				var connection=request.accept(null, request.origin);
	
				if(!(sessionId in this._clientsBySessionCookie)) {
					this._clientsBySessionCookie[sessionId]=new Client(connection);
				}
	
				this.ClientConnected.fire({
					client: this._clientsBySessionCookie[sessionId]
				});
			}
		});
	}

	return Server;
});
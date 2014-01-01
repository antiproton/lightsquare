var WsServer=require("websocket").server;
var http=require("http");

function log(message) {
    console.log(message);
}

var httpServer=http.createServer(function(request, response) {
    console.log("rest");
    response.writeHead(404);
    response.end();
});

httpServer.listen(8080, function() {
    log((new Date())+" Server is listening on port 8080");
});

wsServer=new WsServer({
    httpServer: httpServer
});

var users={};

wsServer.on("request", function(request) {
    var cookies={};

    for(var i=0; i<request.cookies.length; i++) {
        cookies[request.cookies[i].name]=request.cookies[i].value;
    }

    if("session" in cookies) {
        log((new Date())+" Connection accepted "+cookies["session"]);

        var sessionId=cookies["session"];
        var connection=request.accept(null, request.origin);
        var user;

        if(sessionId in users) {
            user=users[sessionId];
        }

        else {
            users[sessionId]=new User();
        }

        //console.log(request);

        connection.on("message", function(message) {
            if(message.type==="utf8") {
                console.log(JSON.parse(message.utf8Data));
                connection.sendUTF(JSON.stringify({"hi":123}));
            }
        });

        connection.on("close", function(reasonCode, description) {
            log((new Date())+" Peer "+connection.remoteAddress+" disconnected.");
        });
    }
});
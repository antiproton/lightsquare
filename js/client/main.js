define(function(require) {
	require("lib/ready@");
	var Server=require("lib/Server");
	
	server=new Server("ws://chess:8080");
	server.connect();
});
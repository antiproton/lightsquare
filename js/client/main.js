define(function(require) {
	require("lib/ready@");
	var Server=require("lib/Server");
	var $=require("lib/dom/byId");
	var TabControl=require("lib/widgets/TabControl/TabControl");
	
	var server=new Server("ws://chess:8080");
	server.connect();
	
	
});
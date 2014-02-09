define(function(require) {
	require("lib/ready@");
	require("lib/dbenums/chess");
	require("lib/dbcodes/chess");
	var time=require("lib/time");
	var Game=require("chess/Game");
	var Table=require("widgets/table/standard/Table");
	var g=require("lib/dom/byId");
	var MoveLabel=require("chess/MoveLabel");
	var Board=require("widgets/board/Board");
	var Position=require("chess/Position");
	var Piece=require("chess/Piece");
	var Server=require("lib/Server");
	var Result=require("chess/Result");
	var ChallengeList=require("widgets/ChallengeList/ChallengeList");
	
	server=new Server("ws://chess:8080");
	server.connect();
});
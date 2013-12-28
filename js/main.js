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

	var table=new Table(g("table"));

	table.board.setSquareSize(60);
	table.board.setShowSurround(false);
	table.board.setSquareStyle(Board.squareStyles.green);
	table.board.setBoardArray(game.position.board.getBoardArray());

	var game=new Game();
	var history=table.history;
	var move=game.move(8, 16);
	var historyMove=history.createMove(move);
	
	history.move(move);
});
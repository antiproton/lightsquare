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

	var game=new Game();


	table.board.setBoardArray(game.position.board.getBoardArray());

	var history=table.history;

	game.move(8, 16);

	var move=history.createMove();

	table.board.setShowSurround(false);

	table.board.setSquareStyle(Board.squareStyles.green);

	history.move(move);
});
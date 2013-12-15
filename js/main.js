define(function(require) {
	require("lib/ready@");
	require("lib/constants");
	require("chess/constants");
	require("lib/dbenums/chess");
	require("lib/dbcodes/chess");

	var Game=require("chess/Game");
	var Table=require("./widgets/table/standard/Table");
	var g=require("lib/dom/byId");
	var MoveLabel=require("chess/MoveLabel");

	var tableWidget=new Table(g("table"));

	//tableWidget.board.setSquareSize(45);

	var game=new Game();

	tableWidget.board.setBoardArray(game.position.board.getBoardArray());

	var history=tableWidget.history;

	var move=history.createMove();
	var label=new MoveLabel();

	label.piece="N";
	move.setLabel(label);

	history.move(move);
});
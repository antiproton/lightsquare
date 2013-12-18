define(function(require) {
	require("lib/ready@");
	require("lib/dbenums/chess");
	require("lib/dbcodes/chess");
	var time=require("lib/time");
	var Game=require("chess/Game");
	var Table=require("./widgets/table/standard/Table");
	var g=require("lib/dom/byId");
	var MoveLabel=require("chess/MoveLabel");

	var table=new Table(g("table"));

	//table.board.setSquareSize(45);

	var game=new Game();

	
	console.log(time());
	game.move(8, 16);
	console.log(time());

	table.board.setBoardArray(game.position.board.getBoardArray());

	var history=table.history;

	var move=history.createMove();
	var label=new MoveLabel();

	label.piece="N";
	move.setLabel(label);

	table.board.setShowSurround(true);

	history.move(move);
});
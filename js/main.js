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

	game=new Game();
	table=new Table(g("table"));

	var fen="r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 30";

	game.setStartingFen(fen)

	var move=game.move(60, 58);
	var historyMove=table.history.createMove(move);

	table.history.move(historyMove);

	table.board.setSquareSize(60);
	table.board.setShowSurround(false);
	table.board.setSquareStyle(Board.squareStyles.green);
	table.board.setBoardArray(game.position.board.getBoardArray());
});
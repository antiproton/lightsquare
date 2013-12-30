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

	var fen="r3kbnr/4pppp/8/8/8/2b5/PPPnPPPP/RNBQKNNR b KQkq - 0 30";

	game.setStartingFen(fen)

	var move=game.move(11, 21);
	var historyMove=table.history.createMove(move);

	table.history.move(historyMove);

	game.move(4, 5);

	table.board.setSquareSize(60);
	table.board.setShowSurround(false);
	table.board.setSquareStyle(Board.squareStyles.green);
	table.board.setBoardArray(game.position.board.getBoardArray());
});
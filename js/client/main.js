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
	
	document.body.appendChild(document.createElement("div"));
	var button=document.createElement("button");
	button.innerHTML="connect";
	document.body.appendChild(button);
	
	server=new Server("ws://chess:8080");
	button.addEventListener("click", function() {
		console.log("connect");
		server.connect();
		server.subscribe("*", function(url, data) {
			if(url!=="/keepalive") {
				console.log(url);
				console.log(data);
			}
		});
	});
	
	button=document.createElement("button");
	button.innerHTML="disconnect";
	document.body.appendChild(button);
	
	button.addEventListener("click", function() {
		console.log("disconnect");
		server.disconnect();
	});
	
	button=document.createElement("button");
	button.innerHTML="send test message";
	document.body.appendChild(button);
	
	button.addEventListener("click", function() {
		server.send(JSON.stringify({
			"/test": {
				blah: 123
			}
		}));
	});

	table=new Table(g("table"));

	var fen="r3kbnr/4pppp/8/8/8/2b5/PPPnPPPP/RNBQKNNR b KQkq - 0 30";

	game=new Game({
		startingFen: fen
	});
	
	var challengeList=new ChallengeList(document.body, server);

	move=game.move(11, 28);
	table.history.move(move);

	move=game.move(5, 11);
	table.history.move(move);
	
	move=game.move(18, 11);
	table.history.move(move);
	
	move=game.move(1, 11);
	table.history.move(move);
	
	move=game.move(52, 44);
	table.history.move(move);
	
	move=game.move(11, 28);
	table.history.move(move);
	
	var res=new Result("gus", "opp", Result.WHITE, Result.types.CHECKMATE);
	
	console.log(res.getDescription());

	table.history.UserSelect.addHandler(this, function(data) {
		var position=data.move.getPositionAfter();

		//game.setPosition(position);
		table.board.setBoardArray(position.getBoard().getBoardArray());
	});

	table.board.highlightSquares(23, Board.squareHighlightTypes.lastMoveFrom);
	table.board.highlightSquares(45, Board.squareHighlightTypes.lastMoveFrom);
	table.board.unhighlightSquares(Board.squareHighlightTypes.lastMoveFrom);
	table.board.setSquareSize(60);
	table.board.setShowSurround(false);
	table.board.setSquareStyle(Board.squareStyles.GREEN);
	table.board.setBoardArray(game.getPosition().getBoard().getBoardArray());
});
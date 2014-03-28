define(function(require) {
	var ChessGame = require("chess/Game");
	var Colour = require("chess/Colour");
	var ChessMove = require("chess/Move");
	var Move = require("common/Move");
	var Event = require("lib/Event");

	function Game(server, game) {
		this.PromotionPieceNeeded = new Event(this);
		this.MoveReceived = new Event(this);
		
		this._server = server;
		this._id = game.id;
		
		this._players = {};
		this._players[Colour.white] = game.white;
		this._players[Colour.black] = game.black;
		
		this._options = game.options;
		this._game = new ChessGame(this._options);
		
		this._history = [];
		this._moveQueue = [];
		
		game.history.forEach((function(move) {
			this._history.push(Move.fromJSON(move));
		}).bind(this));
		
		this._server.subscribe("/game/" + this._id + "/move", (function(move) {
			this._serverMove(move);
		}).bind(this));
	}

	Game.prototype.move = function(from, to, promoteTo) {
		var move = this._game.move(from, to, promoteTo);
		
		if(move.isLegal()) {
			if(move.isPromotion() && promoteTo === undefined) {
				this._game.undoLastMove();
				this.PromotionPieceNeeded.fire();
			}
			
			else {
				this._history.push(move);
				
				this._server.send("/game/" + this._id + "/move", {
					from: from.squareNo,
					to: to.squareNo,
					promoteTo: promoteTo
				});
			}
		}
		
		return move;
	}
	
	Game.prototype.getPosition = function() {
		return this._game.getPosition();
	}
	
	Game.prototype._serverMove = function(move) {
		if(move.index > this._history.length) {
			this._moveQueue[move.index] = move;
		}
		
		else {
			this._applyServerMove(move);
			
			var i = move.index;
			var nextMove;
			
			while(nextMove = this._moveQueue[++i]) {
				this._applyServerMove(nextMove);
			}
		}
	}
	
	Game.prototype._applyServerMove = function(serverMove) {
		var move = this._game.move(
			Square.fromSquareNo(serverMove.from),
			Square.fromSquareNo(serverMove.to),
			serverMove.promoteTo
		);
		
		this._history.push(move);
		
		this.MoveReceived.fire({
			move: move
		});
	}
	
	return Game;
});
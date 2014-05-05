define(function(require) {
	var ChessGame = require("chess/Game");
	var Colour = require("chess/Colour");
	var ChessMove = require("chess/Move");
	var Move = require("common/Move");
	var Event = require("lib/Event");
	var Square = require("chess/Square");
	var PieceType = require("chess/PieceType");
	var Fen = require("chess/Fen");

	function Game(server, gameDetails) {
		this.PromotionPieceNeeded = new Event(this);
		this.Move = new Event(this);
		
		this._server = server;
		this._id = gameDetails.id;
		
		this._players = {};
		this._players[Colour.white] = gameDetails.white;
		this._players[Colour.black] = gameDetails.black;
		
		this._history = [];
		this._moveQueue = [];
		
		gameDetails.history.forEach((function(move) {
			this._history.push(Move.fromJSON(move));
		}).bind(this));
		
		this._options = gameDetails.options;
		
		var startingFen = Fen.STARTING_FEN;
		
		if(this._history.length > 0) {
			startingFen = this._history[this._history.length - 1].getPositionAfter().getFen();
		}
		
		this._game = new ChessGame({
			startingFen: startingFen,
			isTimed: false
		});
		
		this._server.subscribe("/game/" + this._id + "/move", (function(move) {
			this._handleServerMove(move);
		}).bind(this));
		
		this._server.send("/game/" + this._id + "/request/moves", {
			startingIndex: this._history.length
		});
	}
	
	Game.prototype.getId = function() {
		return this._id;
	}

	Game.prototype.move = function(from, to, promoteTo) {
		if(this._isInProgress) {
			var move = new ChessMove(this.getPosition(), from, to, promoteTo);
			
			if(move.isLegal()) {
				if(move.isPromotion() && promoteTo === undefined) {
					this.PromotionPieceNeeded.fire({
						move: move
					});
				}
				
				else {
					this._game.move(from, to, promoteTo);
					this._history.push(move);
					
					this._server.send("/game/" + this._id + "/move", {
						from: from.squareNo,
						to: to.squareNo,
						promoteTo: (promoteTo ? promoteTo.sanString : undefined)
					});
					
					this.Move.fire({
						move: move
					});
				}
			}
		}
	}
	
	Game.prototype.getPosition = function() {
		return this._game.getPosition();
	}
	
	Game.prototype.getHistory = function() {
		return this._history;
	}
	
	Game.prototype.getUserColour = function(user) {
		var player;
		var userColour = null;
		
		Colour.forEach(function(colour) {
			player = this._players[colour];
			
			if((user.isLoggedIn() && user.getUsername() === player.username) || user.getId() === player.id) {
				userColour = colour;
			}
		}, this);
		
		return userColour;
	}
	
	Game.prototype._handleServerMove = function(move) {
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
		var promoteTo = PieceType.queen;
		
		if(serverMove.promoteTo !== undefined) {
			promoteTo = PieceType.fromSanString(serverMove.promoteTo)
		}
		
		var move = this._game.move(
			Square.fromSquareNo(serverMove.from),
			Square.fromSquareNo(serverMove.to),
			promoteTo
		);
		
		if(move.isLegal()) {
			this._history.push(move);
			
			this.Move.fire({
				move: move
			});
		}
	}
	
	return Game;
});
define(function(require) {
	var ChessGame = require("chess/Game");
	var Piece = require("chess/Piece");
	var id = require("lib/id");
	var Colour = require("chess/Colour");
	var Move = require("common/Move");
	
	function Game(white, black, options) {
		this._id = id();
		this._options = options;
		this._game = new ChessGame(this._options);
		
		this._players = [];
		this._players[Piece.WHITE] = white;
		this._players[Piece.BLACK] = black;
		
		this._spectators = [];
		
		this._oldRatings = [];
		this._oldRatings[Piece.WHITE] = null;
		this._oldRatings[Piece.BLACK] = null;
		
		this._newRatings = [];
		this._newRatings[Piece.WHITE] = null;
		this._newRatings[Piece.BLACK] = null;
		
		this._isUndoRequested = false;
		this._isDrawOffered = false;
		
		this._players.forEach((function(user, colour) {
			this._setupPlayer(user, colour);
		}).bind(this));
	}
	
	Game.timingStyles = ChessGame.timingStyles;
	
	Game.prototype.getId = function() {
		return this._id;
	}
	
	Game.prototype._setupPlayer = function(user, colour) {
		this._subscribeToPlayerMessages(user);
			
		user.send("/game/new", this);
		
		user.Replaced.addHandler(this, function(data) {
			var newUser = data.newUser;
			
			this._players[colour] = newUser;
			
			this._setupPlayer(newUser, colour);
		});
	}
	
	Game.prototype._subscribeToPlayerMessages = function(user) {
		user.subscribe("/game/" + this._id + "/move", (function(data) {
			var promoteTo = Piece.QUEEN;
			
			if(data.promoteTo !== undefined) {
				promoteTo = data.promoteTo;
			}
			
			this._move(user, data.from, data.to, promoteTo);
		}).bind(this));
		
		user.subscribe("/game/" + this._id + "/resign", (function() {
			this._resign(user);
		}).bind(this));
		
		user.subscribe("/game/" + this._id + "/offer_draw", (function() {
			this._offerDraw(user);
		}).bind(this));
	}
	
	Game.prototype._move = function(user, from, to, promoteTo) {
		var colour = this._game.getPosition().getActiveColour();
		var oppColour = Colour.getOpposite(colour);
		
		if(this._players[colour] === user) {
			var index = this._game.getHistory().length;
			var move = this._game.move(from, to, promoteTo);
			
			if(move.isLegal()) {
				this._sendToAllUsers("/game/" + this._id + "/move", {
					from: from,
					to: to,
					promoteTo: promoteTo,
					index: index
				});
			}
		}
	}
	
	Game.prototype._resign = function(user) {
		var playerColour = null;
		
		this._players.forEach(function(player, colour) {
			if(player === user) {
				playerColour = colour;
			}
		});
		
		if(playerColour !== null) {
			this._game.resign(playerColour);
			
			this._sendToAllUsers("/game/" + this._id + "/resignation", {
				colour: playerColour
			});
		}
	}
	
	Game.prototype._sendToAllUsers = function(url, data) {
		var allUsers = this._players.concat(this._spectators);
		
		allUsers.forEach(function(user) {
			user.send(url, data);
		});
	}
	
	Game.prototype.toJSON = function() {
		var history = [];
		
		this._game.getHistory().forEach(function(move) {
			history.push(Move.fromMove(move));
		});
		
		return {
			white: this._players[Piece.WHITE],
			black: this._players[Piece.BLACK],
			history: history,
			state: this._game.getState(),
			result: this._game.getResult(),
			resultType: this._game.getResultType(),
			startTime: this._game.getStartTime(),
			endTime: this._game.getEndTime(),
			isThreefoldClaimable: this._game.isThreefoldClaimable(),
			isFiftymoveClaimable: this._game.isFiftymoveClaimable(),
			whiteRatingOld: this._oldRatings[Piece.WHITE],
			whiteRatingNew: this._newRatings[Piece.WHITE],
			blackRatingOld: this._oldRatings[Piece.BLACK],
			blackRatingNew: this._newRatings[Piece.BLACK],
			isUndoRequested: this._isUndoRequested,
			isDrawOffered: this._isDrawOffered,
			options: this._options,
			id: this._id
		};
	}
	
	return Game;
});
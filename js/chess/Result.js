define(function(require) {
	var Piece = require("chess/Piece");
	var Chess = require("chess/Chess");
	
	function Result(white, black, result, type) {
		this._players = [];
		this._players[Piece.WHITE] = white;
		this._players[Piece.BLACK] = black;
		this._result = result;
		this._type = type;
	}
	
	Result.prototype.toString = function() {
		return this.getTally();
	}
	
	Result.prototype.getTally = function() {
		return Result.getTally(this._result);
	}
	
	Result.prototype.getDescription = function() {
		var description = Result._descriptions[this._type];
		
		if(this._result !== Result.DRAW) {
			var winningColour = Result.getWinningColour(this._result);
			var losingColour = Chess.getOppColour(winningColour);
			
			var replacements = {
				"winner": this._players[winningColour],
				"loser": this._players[losingColour]
			};
			
			var regex;
			
			for(var placeholder in replacements) {
				regex = new RegExp("\\[" + placeholder + "\\]", "g");
				description = description.replace(regex, replacements[placeholder]);
			}
		}
		
		return description;
	}

	Result.getWinningColour = function(result) {
		return Result._winningColours[result];
	};

	Result.getWinResult = function(colour) {
		return Result._winResults[colour];
	};

	Result.getScore = function(result, colour) {
		if(result === Result.DRAW) {
			return Result.score.DRAW;
		}

		else {
			return (colour === Result.getWinningColour(result) ? Result.score.WIN : Result.score.LOSS);
		}
	};
	
	Result.getTally = function(result) {
		return Result._tallies[result];
	};
	
	Result.score = {
		WIN: 1,
		DRAW: 0.5,
		LOSS: 0
	};
	
	Result.types = {
		CHECKMATE: "checkmate",
		RESIGNATION: "resignation",
		FIFTYMOVE: "fifty move rule",
		THREEFOLD: "threefold",
		TIMEOUT: "timeout",
		INSUFFICIENT: "insufficient material",
		DRAW_AGREED: "draw agreed"
	};
	
	Result._descriptions = {};
	
	Result._descriptions[Result.types.CHECKMATE] = "[winner] won by checkmate";
	Result._descriptions[Result.types.RESIGNATION] = "[loser] resigned";
	Result._descriptions[Result.types.FIFTYMOVE] = "Fifty move rule";
	Result._descriptions[Result.types.THREEFOLD] = "Threefold repetition";
	Result._descriptions[Result.types.TIMEOUT] = "[loser] forfeit on time";
	Result._descriptions[Result.types.INSUFFICIENT] = "Insufficient mating material";
	Result._descriptions[Result.types.DRAW_AGREED] = "Draw agreed";
	
	Result.WHITE = "white";
	Result.BLACK = "black";
	Result.DRAW = "draw";
	
	Result._tallies = {};
	Result._tallies[Result.WHITE] = "1-0";
	Result._tallies[Result.BLACK] = "0-1";
	Result._tallies[Result.DRAW] = "\u00bd-\u00bd";
	
	Result._winResults = [];
	Result._winResults[Piece.WHITE] = Result.WHITE;
	Result._winResults[Piece.BLACK] = Result.BLACK;
	
	Result._winningColours = {};
	Result._winningColours[Result.WHITE] = Piece.WHITE;
	Result._winningColours[Result.BLACK] = Piece.BLACK;
	
	return Result;
});
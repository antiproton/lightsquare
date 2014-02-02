define(function(require) {
	var Piece=require("chess/Piece");
	
	function Result(white, black, result, resultDetails) {
		this._players=[];
		this._players[Piece.WHITE]=white;
		this._players[Piece.BLACK]=black;
		this._result=result;
		this._resultDetails=resultDetails;
	}
	
	Result.prototype.getSummary=function() {
		var summary;
		
		if(result===Result.DRAW) {
			summary="Draw";
		}
		
		else {
			var players=[];
			
			players[Piece.WHITE]=white;
			players[Piece.BLACK]=black;
			
			var winner=players[Result.getWinningColour(result)];
			
			summary=this._players[Result.getWinningColour(this._result)]+" won";
		}
		
		return summary;
	}
	
	Result.prototype.getTally=function() {
		return Result.getTally(this._result);
	}

	Result.getWinningColour=function(result) {
		return Result._winningColours[result];
	};

	Result.getWinResult=function(colour) {
		return Result._winResults[colour];
	};

	Result.getScore=function(result, colour) {
		if(result===Result.DRAW) {
			return Result.score.DRAW;
		}

		else {
			return (colour===Result.getWinningColour(result)?Result.score.WIN:Result.score.LOSS);
		}
	};
	
	Result.getTally=function(result) {
		return Result._tallies[result];
	};
	
	Result.score={
		WIN: 1,
		DRAW: 0.5,
		LOSS: 0
	};
	
	Result.details={ //FIXME
		CHECKMATE: "checkmate",
		RESIGNATION: "resignation",
		FIFTYMOVE: "fifty move rule",
		THREEFOLD: "threefold repetition",
		TIMEOUT: "timeout",
		INSUFFICIENT: "insufficient mating material",
		AGREEMENT: "agreement"
	};
	
	Result.WHITE="white";
	Result.BLACK="black";
	Result.DRAW="draw";
	
	Result._tallies={};
	Result._tallies[Result.WHITE]="1-0";
	Result._tallies[Result.BLACK]="0-1";
	Result._tallies[Result.DRAW]="\u00bd-\u00bd";
	
	Result._winResults=[];
	Result._winResults[Piece.WHITE]=Result.WHITE;
	Result._winResults[Piece.BLACK]=Result.BLACK;
	
	Result._winningColours={};
	Result._winningColours[Result.WHITE]=Piece.WHITE;
	Result._winningColours[Result.BLACK]=Piece.BLACK;
	
	return Result;
});
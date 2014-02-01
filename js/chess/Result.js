define(function(require) {
	var resultString={};
	
	resultString[Result.WHITE]="1-0";
	resultString[Result.BLACK]="0-1";
	resultString[Result.DRAW]="\u00bd-\u00bd";
	
	var winResult=[];
	
	winResult[Piece.WHITE]=Result.WHITE;
	winResult[Piece.BLACK]=Result.BLACK;
	
	var winningColour={};
	
	winningColour[Result.WHITE]=Piece.WHITE;
	winningColour[Result.BLACK]=Piece.BLACK;
	
	var Result={
		SCORE_WIN: 1,
		SCORE_DRAW: .5,
		SCORE_LOSS: 0,
		
		WHITE: "white",
		BLACK: "black",
		DRAW: "draw",
		
		details: {
			CHECKMATE: "checkmate",
			RESIGNATION: "resignation",
			FIFTYMOVE: "stalemate (fifty move rule)",
			THREEFOLD: "stalemate (threefold repetition)",
			TIMEOUT: "timeout",
			INSUFFICIENT: "stalemate (insufficient mating material)",
			AGREEMENT: "agreement"
		},
	
		getDetailsString: function(white, black, result, resultDetails) {
			var summary;
			var details=Result.details[resultDetails];
			
			if(result===Result.DRAW) {
				summary="Draw";
			}
			
			else {
				var players=[];
				
				players[Piece.WHITE]=white;
				players[Piece.BLACK]=black;
				
				var winner=players[Result.getWinningColour(result)];
				
				summary=winner+" won";
			}
			
			return summary+" ("+details+")";
		},
	
		getString: function(result) {
			return resultString[result];
		},
	
		getWinningColour: function(result) {
			return winningColour[result];
		},
	
		getWinResult: function(colour) {
			return winResult[colour];
		},
	
		getScore: function(result, colour) {
			if(result===Result.DRAW) {
				return Result.SCORE_DRAW;
			}
	
			if(colour===WHITE) {
				return (result===Result.WHITE?Result.SCORE_WIN:Result.SCORE_LOSS);
			}
	
			if(colour===BLACK) {
				return (result===Result.BLACK?Result.SCORE_WIN:Result.SCORE_LOSS);
			}
		}
	};
	
	return Result;
});
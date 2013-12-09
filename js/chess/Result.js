var Result={
	SCORE_WIN: 1,
	SCORE_DRAW: .5,
	SCORE_LOSS: 0,

	getDetailsString: function(white, black, result, resultDetails) {
		var str;
		var winner=[white, black][Result.winningColour[result]];

		if(result===RESULT_DRAW) {
			str="Drawn by ";
		}

		else {
			str=winner+" won by ";
		}

		str+=DbEnums[RESULT_DETAILS][resultDetails].description.toLowerCase();

		return str;
	},

	getString: function(result) {
		return Result._string[result];
	},

	getWinningColour: function(result) {
		return Result._winningColour[result];
	},

	getWinResult: function(colour) {
		return Result._winResult[colour];
	},

	getScore: function(result, colour) {
		if(result===RESULT_DRAW) {
			return Result.SCORE_DRAW;
		}

		if(colour===WHITE) {
			return (result===RESULT_WHITE?Result.SCORE_WIN:Result.SCORE_LOSS);
		}

		if(colour===BLACK) {
			return (result===RESULT_BLACK?Result.SCORE_WIN:Result.SCORE_LOSS);
		}
	}
};

Result._string={};
Result._string[RESULT_WHITE]="1-0";
Result._string[RESULT_BLACK]="0-1";
Result._string[RESULT_DRAW]="\u00bd-\u00bd";

Result._winResult=[];
Result._winResult[WHITE]=RESULT_WHITE;
Result._winResult[BLACK]=RESULT_BLACK;

Result._winningColour={};
Result._winningColour[RESULT_WHITE]=WHITE;
Result._winningColour[RESULT_BLACK]=BLACK;
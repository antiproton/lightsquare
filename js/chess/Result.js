var Result={};

Result.string={};

Result.string[RESULT_WHITE]="1-0";
Result.string[RESULT_BLACK]="0-1";
Result.string[RESULT_DRAW]="\u00bd-\u00bd";

Result.winResult=[
	RESULT_WHITE,
	RESULT_BLACK
];

Result.winningColour={};

Result.winningColour[RESULT_WHITE]=WHITE;
Result.winningColour[RESULT_BLACK]=BLACK;

Result.detailsString=function(game) {
	var str;
	var winner=[game.white, game.black][Result.winningColour[game.result]];

	if(game.result===RESULT_DRAW) {
		str="Drawn by ";
	}

	else {
		str=winner+" won by ";
	}

	str+=DbEnums[RESULT_DETAILS][game.resultDetails].description.toLowerCase();

	return str;
}



	//getScore: function(result, colour) {
	//	if(result===RESULT_DRAW) {
	//		return SCORE_DRAW;
	//	}
	//
	//	if(colour===WHITE) {
	//		return result===RESULT_WHITE?SCORE_WIN:SCORE_LOSS;
	//	}
	//
	//	if(colour===BLACK) {
	//		return result===RESULT_BLACK?SCORE_WIN:SCORE_LOSS;
	//	}
	//},
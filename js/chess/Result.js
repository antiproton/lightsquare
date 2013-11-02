var Result={};

Result.String={};

Result.String[RESULT_WHITE]="1-0";
Result.String[RESULT_BLACK]="0-1";
Result.String[RESULT_DRAW]="\u00bd-\u00bd"; //1/2-1/2 with fraction symbols

Result.WinResult=[
	RESULT_WHITE,
	RESULT_BLACK
];

Result.WinningColour={};

Result.WinningColour[RESULT_WHITE]=WHITE;
Result.WinningColour[RESULT_BLACK]=BLACK;

Result.DetailsString=function(game) {
	var str;
	var winner=[game.White, game.Black][Result.WinningColour[game.Result]];

	if(game.Result===RESULT_DRAW) {
		str="Drawn by ";
	}

	else {
		str=winner+" won by ";
	}

	str+=DbEnums[RESULT_DETAILS][game.ResultDetails].Description.toLowerCase();

	return str;
}
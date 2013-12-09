/*
see the serverside version for notes
*/

var Timing={
	_CHANCE_OF_OVERTIME: .5,
	_AVG_MOVES_PER_GAME: 40,

	getGameFormat: function(style, initial, increment, overtime, overtimeIncrement, overtimeCutoff) {
		if([TIMING_BRONSTEIN_DELAY, TIMING_FISCHER, TIMING_FISCHER_AFTER, TIMING_SIMPLE_DELAY].indexOf(style)===-1) {
			increment=0;
		}

		var totalAdded=increment*Timing._AVG_MOVES_PER_GAME;

		if(overtime) {
			totalAdded+=overtimeIncrement*Timing._CHANCE_OF_OVERTIME;
		}

		var totalTime=initial+totalAdded;
		var maxTime;

		for(var format in Timing._maxTimesByFormat) {
			maxTime=Timing._maxTimesByFormat[format];

			if(totalTime<=maxTime) {
				return format;
			}
		}

		return GAME_FORMAT_CORRESPONDENCE;
	}
};

Timing._maxTimesByFormat={};

Timing._maxTimesByFormat[GAME_FORMAT_BULLET]=60;
Timing._maxTimesByFormat[GAME_FORMAT_BLITZ]=600;
Timing._maxTimesByFormat[GAME_FORMAT_QUICK]=1800;
Timing._maxTimesByFormat[GAME_FORMAT_STANDARD]=86400;
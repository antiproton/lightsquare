/*
see the serverside version for notes
*/

var Timing={
	overtime_chance: function(cutoff) {
		var high_chance=15;
		var low_chance=90;
		var scale=low_chance-high_chance;

		if(cutoff<high_chance) {
			return 1;
		}

		else if(cutoff>low_chance) {
			return 0.01;
		}

		else {
			return (1/scale*(cutoff-high_chance));
		}
	},

	GetFormat: function(style, initial, increment, overtime, overtime_increment, overtime_cutoff) {
		if(style!==TIMING_BRONSTEIN_DELAY && style!==TIMING_FISCHER && style!==TIMING_FISCHER_AFTER && style!==TIMING_SIMPLE_DELAY) {
			increment=0;
		}

		var total_added=increment*Timing.AVG_MOVES_PER_GAME;

		if(overtime) {
			total_added+=overtime_increment*Timing.overtime_chance(overtime_cutoff);
		}

		var total_time=initial+total_added;
		var max_time;

		for(var format in Timing.MaxTimes) {
			max_time=Timing.MaxTimes[format];

			if(total_time<=max_time) {
				return format;
			}
		}

		return GAME_FORMAT_CORRESPONDENCE;
	}
};

Timing.AVG_MOVES_PER_GAME=40;

Timing.MaxTimes={};

Timing.MaxTimes[GAME_FORMAT_BULLET]=60;
Timing.MaxTimes[GAME_FORMAT_BLITZ]=600;
Timing.MaxTimes[GAME_FORMAT_QUICK]=1800;
Timing.MaxTimes[GAME_FORMAT_STANDARD]=86400;
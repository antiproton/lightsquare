/*
NOTE parsing functionality has been removed - users input the initial time and
increment in separate boxes so there is no need for it, and the old Parse didn't
understand overtime.
*/

var ClockTimeDisplay={
	/*
	get short display string for basic time controls, e.g. "10m" or "10/5"
	*/

	encode: function(style, initial, increment) {
		var isIncrementStyle=in_array(style, [
			TIMING_FISCHER,
			TIMING_FISCHER_AFTER,
			TIMING_BRONSTEIN_DELAY,
			TIMING_SIMPLE_DELAY
		]);

		var defUnitsMain=!isIncrementStyle;
		var str=TimeParser.encode(initial, defUnitsMain, "m");

		if(isIncrementStyle) {
			str+="/"+TimeParser.encode(increment, false, "s");
		}

		return str;
	},

	/*
	get display string with full details, e.g. "10h/1 Bronstein Delay + 2m @ 300 moves"
	*/

	encodeFull: function(style, initial, increment, overtime, overtimeIncrement, overtimeCutoff) {
		var str=DbEnums[TIMING][TIMING_NONE].description;

		if(style!==TIMING_NONE) {
			str=ClockTimeDisplay.encode(style, initial, increment);

			if(style!==TIMING_SUDDEN_DEATH) {
				str+=" "+DbEnums[TIMING][style].description;
			}

			if(overtime) {
				str+=" + "+TimeParser.encode(overtimeIncrement, true)+" @ "+overtimeCutoff+" moves";
			}
		}

		return str;
	}
};
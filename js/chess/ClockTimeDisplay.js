/*
NOTE parsing functionality has been removed - users input the initial time and
increment in separate boxes so there is no need for it, and the old Parse didn't
understand overtime.
*/

var ClockTimeDisplay={
	/*
	get short display string for basic time controls, e.g. "10m" or "10/5"
	*/

	Encode: function(style, initial, increment) {
		var increment_style=in_array(style, [
			TIMING_FISCHER,
			TIMING_FISCHER_AFTER,
			TIMING_BRONSTEIN_DELAY,
			TIMING_SIMPLE_DELAY
		]);

		var def_units_main=!increment_style;
		var str=TimeParser.Encode(initial, def_units_main, "m");

		if(increment_style) {
			str+="/"+TimeParser.Encode(increment, false, "s");
		}

		return str;
	},

	/*
	get display string with full details, e.g. "10h/1 Bronstein Delay + 2m @ 300 moves"
	*/

	EncodeFull: function(style, initial, increment, overtime, overtime_increment, overtime_cutoff) {
		var str=DbEnums[TIMING][TIMING_NONE].Description;

		if(style!==TIMING_NONE) {
			str=ClockTimeDisplay.Encode(style, initial, increment);

			if(style!==TIMING_SUDDEN_DEATH) {
				str+=" "+DbEnums[TIMING][style].Description;
			}

			if(overtime) {
				str+=" + "+TimeParser.Encode(overtime_increment, true)+" @ "+overtime_cutoff+" moves";
			}
		}

		return str;
	}
};
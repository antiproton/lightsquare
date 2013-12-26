var TimeUtils={
	_CHANCE_OF_OVERTIME: .5,
	_AVG_MOVES_PER_GAME: 40,

	getColonDisplay: function(mtime, displayTenths) {
		var parts=[];
		var time=Math.floor(mtime/MSEC_PER_SEC);
		var tenths=Math.floor((mtime%MSEC_PER_SEC)/(MSEC_PER_SEC/10));
		var remaining=time;
		var remainder;
		var divisor;
		var onFirstPart=true;
		var haveNonZeroParts=false;
		var display;
		var partMultiples=[24, 60, 60, 1];
		var n, str;

		var minParts=2; //at least 0:12 if there are only 12 seconds left, but not 0:00:12
		var minDigits=2;

		for(var i=0; i<partMultiples.length; i++) {
			divisor=partMultiples[i];

			for(var j=i+1; j<partMultiples.length; j++) {
				divisor*=partMultiples[j];
			}

			remainder=remaining%divisor;
			n=(remaining-remainder)/divisor;
			str=""+n;

			if(!onFirstPart) {
				while(str.length<minDigits) {
					str="0"+str;
				}
			}

			if(n>0 || haveNonZeroParts || i>=partMultiples.length-minParts) {
				parts.push(str);
				onFirstPart=false;
			}

			remaining=remainder;

			if(n>0) {
				haveNonZeroParts=true;
			}
		}

		display=parts.join(":");

		if(displayTenths) {
			display+="."+tenths;
		}

		return display;
	},

	getGameFormat: function(style, initial, increment, overtime, overtimeIncrement, overtimeCutoff) {
		if([TIMING_BRONSTEIN_DELAY, TIMING_FISCHER, TIMING_FISCHER_AFTER, TIMING_SIMPLE_DELAY].indexOf(style)===-1) {
			increment=0;
		}

		var totalAdded=increment*TimeUtils._AVG_MOVES_PER_GAME;

		if(overtime) {
			totalAdded+=overtimeIncrement*TimeUtils._CHANCE_OF_OVERTIME;
		}

		var totalTime=initial+totalAdded;
		var maxTime;

		for(var format in TimeUtils._maxTimesByFormat) {
			maxTime=TimeUtils._maxTimesByFormat[format];

			if(totalTime<=maxTime) {
				return format;
			}
		}

		return GAME_FORMAT_CORRESPONDENCE;
	}
};

TimeUtils._maxTimesByFormat={};

TimeUtils._maxTimesByFormat[GAME_FORMAT_BULLET]=60;
TimeUtils._maxTimesByFormat[GAME_FORMAT_BLITZ]=600;
TimeUtils._maxTimesByFormat[GAME_FORMAT_QUICK]=1800;
TimeUtils._maxTimesByFormat[GAME_FORMAT_STANDARD]=86400;
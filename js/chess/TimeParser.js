var TimeParser=(function() {
	var numberRe=/\d/;
	var unitRe=/[ywdhms]/i;

	var unitMultipliers={
		"s": 1,
		"m": 60,
		"h": 60,
		"d": 24,
		"w": 7,
		"y": 52
	};

	/*
	calculate how many seconds are in one of each unit for later calculations
	*/

	var secondsMultipliers={};
	var multiplier=1;

	for(var unit in unitMultipliers) {
		multiplier*=unitMultipliers[unit];
		secondsMultipliers[unit]=multiplier;
	}

	var timeString="";
	var currentChar="";
	var i=-1;
	var chars=[];
	var currentTime=0;

	function setString(str) {
		timeString=str;
		chars=str.split("");
		reset();
	}

	function reset() {
		i=-1;
		currentChar="";
		currentTime=0;
	}

	function readTime(defaultUnits) {
		var number=readNumber();
		var unit=readUnits(defaultUnits);
		var multiplier=secondsMultipliers[unit];

		return number*multiplier;
	}

	function readNumber() {
		while(!match(numberRe) && !eof()) {
			next();
		}

		var str="";
		var n=0;

		if(!eof()) {
			while(match(numberRe)) {
				str+=read();
			}

			if(str.length>0) {
				n=parseInt(str);
			}
		}

		return n;
	}

	function readUnits(defaultUnits) {
		var unit=defaultUnits;

		while(!match(unitRe) && !eof()) {
			next();
		}

		if(!eof()) {
			unit=read();
		}

		return unit.toLowerCase();
	}

	function next() {
		i++;

		if(eof()) {
			currentChar="";
		}

		else {
			currentChar=chars[i];
		}
	}

	function eof() {
		return (i>=string.length);
	}

	function read() {
		var str=currentChar;

		next();

		return str;
	}

	function eq(str) {
		return (currentChar===str);
	}

	function match(re) {
		return (re.test(currentChar));
	}

	return {
		defaultUnits: "m",

		parse: function(timeString, defaultUnits) {
			defaultUnits=defaultUnits||this.defaultUnits;

			setString(timeString);
			reset();
			next();

			while(!eof()) {
				currentTime+=readTime(defaultUnits);
			}

			return currentTime;
		},

		encode: function(time, displayDefaultUnits, defaultUnits) {
			if(is_undefined(displayDefaultUnits)) {
				displayDefaultUnits=true;
			}

			defaultUnits=defaultUnits||null;

			var timeString="0";

			if(time>0) {
				var secondsMultipliers={};
				var sections={};
				var remaining=time;
				var divider, quantity;

				//first we need a reversed version of secondsMultipliers, to do years first

				var units=[];

				for(var unit in secondsMultipliers) {
					units.push(unit);
				}

				units.reverse();

				for(i=0; i<units.length; i++) {
					divider=secondsMultipliers[units[i]];

					if(remaining>=divider) {
						quantity=Math.floor(remaining/divider);
						remaining=remaining%divider;
						sections[unit[i]]=quantity;
					}
				}

				var unitStrings=[];

				/*
				build up the strings ("1y", "3d" etc)
				for the default units (e.g. minutes, where 20m should just be 20), don't display
				the units if there is nothing after it (20 minutes and 3 seconds should be 20m3s
				not just 203s)
				*/

				for(var unit in sections) {
					if(unit===defaultUnits && time%secondsMultipliers[unit]===0 && !displayDefaultUnits) {
						unitStrings.push(sections[unit]);
					}

					else {
						unitStrings.push(sections[unit]+unit);
					}
				}

				timeString=unitStrings.join("");
			}

			return timeString;
		}
	};
})();
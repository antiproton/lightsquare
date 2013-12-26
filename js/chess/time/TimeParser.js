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
		return (i>=timeString.length);
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

			defaultUnits=defaultUnits||this.defaultUnits;

			var timeString="0";

			if(time>0) {
				var parts={};
				var remaining=time;
				var divider, quantity;

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
						parts[units[i]]=quantity;
					}
				}

				var unitStrings=[];

				for(var unit in parts) {
					if(unit===defaultUnits && time%secondsMultipliers[unit]===0 && !displayDefaultUnits) {
						unitStrings.push(parts[unit]);
					}

					else {
						unitStrings.push(parts[unit]+unit);
					}
				}

				timeString=unitStrings.join("");
			}

			return timeString;
		}
	};
})();
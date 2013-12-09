var TimeParser=new (function () {
	this._numberRe=/\d/;
	this._unitRe=/[ywdhms]/i;

	this._unitMultipliers={
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

	this._secondsMultipliers={};

	var multiplier=1;

	for(var unit in this._unitMultipliers) {
		multiplier*=this._unitMultipliers[unit];

		this._secondsMultipliers[unit]=multiplier;
	}

	this.defaultUnits="m";
	this.str="";
	this.currentChar="";
	this.i=-1;
	this.chars=[];
	this.result=null;
	this._currentTime=0;
})();

TimeParser.parse=function(str, defaultUnits) {
	defaultUnits=defaultUnits||this.defaultUnits;
	var success=true;

	this._setString(str);

	this._reset();
	this._next();

	while(!this._eof()) {
		this._currentTime+=this._readTime(defaultUnits);
	}

	this.result=this._currentTime;

	return this._currentTime;
}

TimeParser.encode=function(time, displayDefaultUnits, defaultUnits) {
	if(is_undefined(displayDefaultUnits)) {
		displayDefaultUnits=true;
	}

	defaultUnits=defaultUnits||null;

	var str="0";

	if(time>0) {
		var secondsMultipliers={};
		var sections={};
		var remaining=time;
		var divider, quantity;

		//first we need a reversed version of secondsMultipliers, to do years first

		var multipliers=[];

		for(var u in this._secondsMultipliers) {
			multipliers.push({
				Units: u,
				Multiplier: this._secondsMultipliers[u]
			});
		}

		multipliers.reverse();

		for(var i=0; i<multipliers.length; i++) {
			secondsMultipliers[multipliers[i].Units]=multipliers[i].Multiplier;
		}

		for(var u in secondsMultipliers) {
			divider=secondsMultipliers[u];

			if(remaining>=divider) {
				quantity=Math.floor(remaining/divider);
				remaining=remaining%divider;
				sections[u]=quantity;
			}
		}

		var unit_strs=[];

		/*
		build up the strings ("1y", "3d" etc)
		for the default units (e.g. minutes, where 20m should just be 20), don't display
		the units if there is nothing after it (20 minutes and 3 seconds should be 20m3s
		not just 203s)
		*/

		for(var u in sections) {
			if(u===defaultUnits && time%secondsMultipliers[u]===0 && !displayDefaultUnits) {
				unit_strs.push(sections[u]);
			}

			else {
				unit_strs.push(sections[u]+u);
			}
		}

		str=unit_strs.join("");
	}

	return str;
}

TimeParser.getColonDisplay=function(mtime, display_tenths) {
	var sections=[];
	var time=Math.floor(mtime/MSEC_PER_SEC);
	var tenths=Math.floor((mtime%MSEC_PER_SEC)/(MSEC_PER_SEC/10));
	var remaining=time;
	var remainder;
	var n, str;
	var divisor;
	var onFirstSection=true;
	var nonzero=false; //have we encountered any sections with 1 or more units yet
	var display;
	var sectionMultiples=[24, 60, 60, 1]; //days, hours, minutes, seconds (don't divide seconds into anything)

	//these two should really be parameters

	var minSections=2; //at least 0:12 if there are only 12 seconds left, but not 0:00:12
	var minDigits=2;

	for(var i=0; i<sectionMultiples.length; i++) {
		divisor=sectionMultiples[i];

		for(var j=i+1; j<sectionMultiples.length; j++) {
			divisor*=sectionMultiples[j];
		}

		remainder=remaining%divisor;
		n=(remaining-remainder)/divisor;
		str=""+n;

		if(!onFirstSection) {
			while(str.length<minDigits) {
				str="0"+str;
			}
		}

		if(n>0 || nonzero || i>=sectionMultiples.length-minSections) {
			sections.push(str);
			onFirstSection=false;
		}

		remaining=remainder;

		if(n>0) {
			nonzero=true;
		}
	}

	display=sections.join(":");

	if(display_tenths) {
		display+="."+tenths;
	}

	return display;
}

TimeParser._setString=function(str) {
	this.str=str;
	this.chars=str.split("");
	this._reset();
}

TimeParser._reset=function() {
	this.i=-1;
	this.currentChar="";
	this._currentTime=0;
}

TimeParser._readTime=function(defaultUnits) {
	var number=this._readNumber();
	var unit=this._readUnits(defaultUnits);
	var multiplier=this._secondsMultipliers[unit];

	return number*multiplier;
}

TimeParser._readNumber=function() {
	while(!this._match(this._numberRe) && !this._eof()) {
		this._next();
	}

	var str="";
	var n=0;

	if(!this._eof()) {
		while(this._match(this._numberRe)) {
			str+=this._read();
		}

		if(str.length>0) {
			n=parseInt(str);
		}
	}

	return n;
}

TimeParser._readUnits=function(defaultUnits) {
	var unit=defaultUnits;

	while(!this._match(this._unitRe) && !this._eof()) {
		this._next();
	}

	if(!this._eof()) {
		unit=this._read();
	}

	return unit.toLowerCase();
}

TimeParser._next=function() {
	this.i++;

	if(this._eof()) {
		this.currentChar="";
	}

	else {
		this.currentChar=this.chars[this.i];
	}
}

TimeParser._eof=function() {
	return (this.i>=this.str.length);
}

TimeParser._read=function() {
	var str=this.currentChar;

	this._next();

	return str;
}

TimeParser._eq=function(str) {
	return (this.currentChar===str);
}

TimeParser._match=function(re) {
	return (re.test(this.currentChar));
}
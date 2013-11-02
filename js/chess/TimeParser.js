var TimeParser=new (function () {
	this.number_re=/\d/;
	this.unit_re=/[ywdhms]/i;

	this.unit_multipliers={
		"s": 1,
		"m": 60,
		"h": 60,
		"d": 24,
		"w": 7,
		"y": 52
	};

	this.seconds_multipliers={};
	var m=1;

	for(var u in this.unit_multipliers) {
		m*=this.unit_multipliers[u];
		this.seconds_multipliers[u]=m;
	}

	this.DefaultUnits="m";
	this.Str="";
	this.CurrentChar="";
	this.I=-1;
	this.Chars=[];
	this.Result=null;
	this.current_time=0;
})();

TimeParser.Parse=function(str, default_units) {
	default_units=default_units||this.DefaultUnits;
	var success=true;

	this.set_string(str);

	this.reset();
	this.next();

	while(!this.eof()) {
		this.current_time+=this.read_time(default_units);
	}

	this.Result=this.current_time;

	return this.current_time;
}

TimeParser.Encode=function(time, display_default_units, default_units) {
	if(is_undefined(display_default_units)) {
		display_default_units=true;
	}

	default_units=default_units||null;

	var str="0";

	if(time>0) {
		var seconds_multipliers={};
		var sections={};
		var remaining=time;
		var divider, quantity;

		//first we need a reversed version of seconds_multipliers, to do years first

		var multipliers=[];

		for(var u in this.seconds_multipliers) {
			multipliers.push({
				Units: u,
				Multiplier: this.seconds_multipliers[u]
			});
		}

		multipliers.reverse();

		for(var i=0; i<multipliers.length; i++) {
			seconds_multipliers[multipliers[i].Units]=multipliers[i].Multiplier;
		}

		for(var u in seconds_multipliers) {
			divider=seconds_multipliers[u];

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
			if(u===default_units && time%seconds_multipliers[u]===0 && !display_default_units) {
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

TimeParser.GetColonDisplay=function(mtime, display_tenths) {
	var sections=[];
	var time=Math.floor(mtime/MSEC_PER_SEC);
	var tenths=Math.floor((mtime%MSEC_PER_SEC)/(MSEC_PER_SEC/10));
	var remaining=time;
	var remainder;
	var n, str;
	var divisor;
	var first_section=true;
	var nonzero=false; //have we encountered any sections with 1 or more units yet
	var display;
	var section_multiples=[24, 60, 60, 1]; //days, hours, minutes, seconds (don't divide seconds into anything)

	//these two should really be parameters

	var min_sections=2; //at least 0:12 if there are only 12 seconds left, but not 0:00:12
	var min_digits=2;

	for(var i=0; i<section_multiples.length; i++) {
		divisor=section_multiples[i];

		for(var j=i+1; j<section_multiples.length; j++) {
			divisor*=section_multiples[j];
		}

		remainder=remaining%divisor;
		n=(remaining-remainder)/divisor;
		str=""+n;

		if(!first_section) {
			while(str.length<min_digits) {
				str="0"+str;
			}
		}

		if(n>0 || nonzero || i>=section_multiples.length-min_sections) {
			sections.push(str);
			first_section=false;
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

TimeParser.set_string=function(str) {
	this.Str=str;
	this.Chars=str.split("");
	this.reset();
}

TimeParser.reset=function() {
	this.I=-1;
	this.CurrentChar="";
	this.current_time=0;
}

TimeParser.read_time=function(default_units) {
	var number=this.read_number();
	var unit=this.read_units(default_units);
	var multiplier=this.seconds_multipliers[unit];

	return number*multiplier;
}

TimeParser.read_number=function() {
	while(!this.match(this.number_re) && !this.eof()) {
		this.next();
	}

	var str="";
	var n=0;

	if(!this.eof()) {
		while(this.match(this.number_re)) {
			str+=this.read();
		}

		if(str.length>0) {
			n=parseInt(str);
		}
	}

	return n;
}

TimeParser.read_units=function(default_units) {
	var unit=default_units;

	while(!this.match(this.unit_re) && !this.eof()) {
		this.next();
	}

	if(!this.eof()) {
		unit=this.read();
	}

	return unit.toLowerCase();
}

TimeParser.next=function() {
	this.I++;

	if(this.eof()) {
		this.CurrentChar="";
	}

	else {
		this.CurrentChar=this.Chars[this.I];
	}
}

TimeParser.eof=function() {
	return (this.I>=this.Str.length);
}

TimeParser.read=function() {
	var str=this.CurrentChar;

	this.next();

	return str;
}

TimeParser.eq=function(str) {
	return (this.CurrentChar===str);
}

TimeParser.match=function(re) {
	return (re.test(this.CurrentChar));
}
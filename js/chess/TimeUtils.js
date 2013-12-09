var TimeUtils={
	getColonDisplay: function(mtime, displayTenths) {
		var sections=[];
		var time=Math.floor(mtime/MSEC_PER_SEC);
		var tenths=Math.floor((mtime%MSEC_PER_SEC)/(MSEC_PER_SEC/10));
		var remaining=time;
		var remainder;
		var n, str;
		var divisor;
		var onFirstSection=true;
		var haveNonZeroSections=false;
		var display;
		var sectionMultiples=[24, 60, 60, 1]; //days, hours, minutes, seconds (don't divide seconds into anything)

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

			if(n>0 || haveNonZeroSections || i>=sectionMultiples.length-minSections) {
				sections.push(str);
				onFirstSection=false;
			}

			remaining=remainder;

			if(n>0) {
				haveNonZeroSections=true;
			}
		}

		display=sections.join(":");

		if(displayTenths) {
			display+="."+tenths;
		}

		return display;
	}
};
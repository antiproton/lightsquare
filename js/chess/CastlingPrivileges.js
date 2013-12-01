function CastlingPrivileges() {
	this.privsBySide=[];
	this.privsByFile=[];

	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var side, colour;

	for(var c=0; c<colours.length; c++) {
		colour=colours[c];

		for(var s=0; s<sides.length; s++) {
			side=sides[s];

			if(!(colour in this.privsBySide)) {
				this.privsBySide[colour]=[];
			}

			this.privsBySide[colour][side]=false;
		}

		for(var file=0; file<8; file++) {
			if(!(colour in this.privsByFile)) {
				this.privsByFile[colour]=[];
			}

			this.privsByFile[colour][file]=false;
		}
	}
}

CastlingPrivileges.MODE_SIDE=0;
CastlingPrivileges.MODE_FILE=1;

CastlingPrivileges.sideChars=[
	[
		FEN_WHITE_CASTLE_KS,
		FEN_WHITE_CASTLE_QS
	],
	[
		FEN_BLACK_CASTLE_KS,
		FEN_BLACK_CASTLE_QS
	]
];

CastlingPrivileges.fileChars=[
	[
		FEN_WHITE_CASTLE_A,
		FEN_WHITE_CASTLE_B,
		FEN_WHITE_CASTLE_C,
		FEN_WHITE_CASTLE_D,
		FEN_WHITE_CASTLE_E,
		FEN_WHITE_CASTLE_F,
		FEN_WHITE_CASTLE_G,
		FEN_WHITE_CASTLE_H
	],
	[
		FEN_BLACK_CASTLE_A,
		FEN_BLACK_CASTLE_B,
		FEN_BLACK_CASTLE_C,
		FEN_BLACK_CASTLE_D,
		FEN_BLACK_CASTLE_E,
		FEN_BLACK_CASTLE_F,
		FEN_BLACK_CASTLE_G,
		FEN_BLACK_CASTLE_H
   ]
];

CastlingPrivileges.fileToSide=[];
CastlingPrivileges.fileToSide[0]=QUEENSIDE;
CastlingPrivileges.fileToSide[7]=KINGSIDE;

CastlingPrivileges.sideToFile=[]
CastlingPrivileges.sideToFile[KINGSIDE]=7;
CastlingPrivileges.sideToFile[QUEENSIDE]=0;

CastlingPrivileges.prototype.reset=function() {
	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var side, colour;

	for(var c=0; c<colours.length; c++) {
		colour=colours[c];

		for(var s=0; s<sides.length; s++) {
			side=sides[s];

			this.privsBySide[colour][side]=false;
		}

		for(var file=0; file<8; file++) {
			this.privsByFile[colour][file]=false;
		}
	}
}

CastlingPrivileges.prototype.set=function(colour, index, allow, mode) {
	mode=mode||CastlingPrivileges.MODE_SIDE;

	switch(mode) {
		case CastlingPrivileges.MODE_SIDE: {
			this.privsBySide[colour][index]=allow;
			this.privsByFile[colour][CastlingPrivileges.sideToFile[index]]=allow;

			break;
		}

		case CastlingPrivileges.MODE_FILE: {
			this.privsByFile[colour][index]=allow;

			if(index in CastlingPrivileges.fileToSide) {
				this.privsBySide[colour][CastlingPrivileges.fileToSide[index]]=allow;
			}

			break;
		}
	}
}

CastlingPrivileges.prototype.get=function(colour, index, mode) {
	mode=mode||CastlingPrivileges.MODE_SIDE;

	switch(mode) {
		case CastlingPrivileges.MODE_SIDE: {
			return this.privsBySide[colour][index];
		}

		case CastlingPrivileges.MODE_FILE: {
			return this.privsByFile[colour][index];
		}
	}
}

CastlingPrivileges.prototype.setStr=function(str) {
	this.reset();

	if(str!==FEN_NONE) {
		var arr=str.split("");
		var ch, lowerChar, upperChar;
		var colour, mode, index;

		for(var i=0; i<arr.length; i++) {
			ch=arr[i];

			lowerChar=ch.toLowerCase();
			upperChar=ch.toUpperCase();

			colour=(ch===upperChar)?WHITE:BLACK;
			mode=(FILE.indexOf(lowerChar)!==-1)?CastlingPrivileges.MODE_FILE:CastlingPrivileges.MODE_SIDE;

			switch(mode) {
				case CastlingPrivileges.MODE_SIDE: {
					index=(FEN_BLACK_CASTLE_KS+FEN_BLACK_CASTLE_QS).indexOf(lowerChar);

					break;
				}

				case CastlingPrivileges.MODE_FILE: {
					index=FILE.indexOf(lowerChar);

					break;
				}
			}

			this.Set(colour, index, true, mode);
		}
	}
}

CastlingPrivileges.prototype.getStr=function() {
	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var colour, side, ch;

	var files=[
		7,
		0
	];

	var privs=[
		[],
		[]
	];

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		for(var file=0; file<8; file++) {
			if(this.privsByFile[colour][file]) {
				ch=CastlingPrivileges.fileChars[colour][file];

				if(file in CastlingPrivileges.fileToSide) {
					ch=CastlingPrivileges.sideChars[colour][CastlingPrivileges.fileToSide[file]];
				}

				privs[colour].push(ch);
			}
		}
	}

	var str=privs[WHITE].join("")+privs[BLACK].join("");

	if(str=="") {
		str=FEN_NONE;
	}

	return str;
}
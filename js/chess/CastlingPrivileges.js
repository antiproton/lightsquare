function CastlingPrivileges() {
	this.privs_side=[];
	this.privs_file=[];

	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var side, colour;

	for(var c=0; c<colours.length; c++) {
		colour=colours[c];

		for(var s=0; s<sides.length; s++) {
			side=sides[s];

			if(!(colour in this.privs_side)) {
				this.privs_side[colour]=[];
			}

			this.privs_side[colour][side]=false;
		}

		for(var file=0; file<8; file++) {
			if(!(colour in this.privs_file)) {
				this.privs_file[colour]=[];
			}

			this.privs_file[colour][file]=false;
		}
	}
}

CastlingPrivileges.MODE_SIDE=0;
CastlingPrivileges.MODE_FILE=1;

CastlingPrivileges.SideChars=[
	[
		FEN_WHITE_CASTLE_KS,
		FEN_WHITE_CASTLE_QS
	],
	[
		FEN_BLACK_CASTLE_KS,
		FEN_BLACK_CASTLE_QS
	]
];

CastlingPrivileges.FileChars=[
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

CastlingPrivileges.FileToSide=[];
CastlingPrivileges.FileToSide[0]=QUEENSIDE;
CastlingPrivileges.FileToSide[7]=KINGSIDE;

CastlingPrivileges.SideToFile=[7, 0];

CastlingPrivileges.prototype.Reset=function() {
	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var side, colour;

	for(var c=0; c<colours.length; c++) {
		colour=colours[c];

		for(var s=0; s<sides.length; s++) {
			side=sides[s];

			this.privs_side[colour][side]=false;
		}

		for(var file=0; file<8; file++) {
			this.privs_file[colour][file]=false;
		}
	}
}

CastlingPrivileges.prototype.Set=function(colour, index, allow, mode) {
	mode=mode||CastlingPrivileges.MODE_SIDE;

	switch(mode) {
		case CastlingPrivileges.MODE_SIDE: {
			this.privs_side[colour][index]=allow;
			this.privs_file[colour][CastlingPrivileges.SideToFile[index]]=allow;

			break;
		}

		case CastlingPrivileges.MODE_FILE: {
			this.privs_file[colour][index]=allow;

			if(index in CastlingPrivileges.FileToSide) {
				this.privs_side[colour][CastlingPrivileges.FileToSide[index]]=allow;
			}

			break;
		}
	}
}

CastlingPrivileges.prototype.Get=function(colour, index, mode) {
	mode=mode||CastlingPrivileges.MODE_SIDE;

	switch(mode) {
		case CastlingPrivileges.MODE_SIDE: {
			return this.privs_side[colour][index];
		}

		case CastlingPrivileges.MODE_FILE: {
			return this.privs_file[colour][index];
		}
	}
}

CastlingPrivileges.prototype.SetStr=function(str) {
	this.Reset();

	if(str!==FEN_NONE) {
		var arr=str.split("");
		var ch, lower_char, upper_char;
		var colour, mode, index;

		for(var i=0; i<arr.length; i++) {
			ch=arr[i];

			lower_char=ch.toLowerCase();
			upper_char=ch.toUpperCase();

			colour=(ch===upper_char)?WHITE:BLACK;
			mode=(FILE.indexOf(lower_char)!==-1)?CastlingPrivileges.MODE_FILE:CastlingPrivileges.MODE_SIDE;

			switch(mode) {
				case CastlingPrivileges.MODE_SIDE: {
					index=(FEN_BLACK_CASTLE_KS+FEN_BLACK_CASTLE_QS).indexOf(lower_char);

					break;
				}

				case CastlingPrivileges.MODE_FILE: {
					index=FILE.indexOf(lower_char);

					break;
				}
			}

			this.Set(colour, index, true, mode);
		}
	}
}

CastlingPrivileges.prototype.GetStr=function() {
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
			if(this.privs_file[colour][file]) {
				ch=CastlingPrivileges.FileChars[colour][file];

				if(file in CastlingPrivileges.FileToSide) {
					ch=CastlingPrivileges.SideChars[colour][CastlingPrivileges.FileToSide[file]];
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
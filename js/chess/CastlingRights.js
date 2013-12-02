/*
this object represents the castling rights for both sides

it handles regular notation (kqKQ) as well as the file notation used
in Chess960 FENs (ahAH)
*/

function CastlingRights() {
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

CastlingRights.MODE_SIDE=0;
CastlingRights.MODE_FILE=1;

CastlingRights.sideChars=[
	[
		FEN_WHITE_CASTLE_KS,
		FEN_WHITE_CASTLE_QS
	],
	[
		FEN_BLACK_CASTLE_KS,
		FEN_BLACK_CASTLE_QS
	]
];

CastlingRights.fileChars=[
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

CastlingRights._fileToSide=[];
CastlingRights._fileToSide[0]=QUEENSIDE;
CastlingRights._fileToSide[7]=KINGSIDE;

CastlingRights._sideToFile=[]
CastlingRights._sideToFile[KINGSIDE]=7;
CastlingRights._sideToFile[QUEENSIDE]=0;

CastlingRights.prototype.reset=function() {
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

CastlingRights.prototype.set=function(colour, index, allow, mode) {
	mode=mode||CastlingRights.MODE_SIDE;

	switch(mode) {
		case CastlingRights.MODE_SIDE: {
			this.privsBySide[colour][index]=allow;
			this.privsByFile[colour][CastlingRights._sideToFile[index]]=allow;

			break;
		}

		case CastlingRights.MODE_FILE: {
			this.privsByFile[colour][index]=allow;

			if(index in CastlingRights._fileToSide) {
				this.privsBySide[colour][CastlingRights._fileToSide[index]]=allow;
			}

			break;
		}
	}
}

CastlingRights.prototype.get=function(colour, index, mode) {
	mode=mode||CastlingRights.MODE_SIDE;

	switch(mode) {
		case CastlingRights.MODE_SIDE: {
			return this.privsBySide[colour][index];
		}

		case CastlingRights.MODE_FILE: {
			return this.privsByFile[colour][index];
		}
	}
}

CastlingRights.prototype.setStr=function(str) {
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
			mode=(FILE.indexOf(lowerChar)!==-1)?CastlingRights.MODE_FILE:CastlingRights.MODE_SIDE;

			switch(mode) {
				case CastlingRights.MODE_SIDE: {
					index=(FEN_BLACK_CASTLE_KS+FEN_BLACK_CASTLE_QS).indexOf(lowerChar);

					break;
				}

				case CastlingRights.MODE_FILE: {
					index=FILE.indexOf(lowerChar);

					break;
				}
			}

			this.set(colour, index, true, mode);
		}
	}
}

CastlingRights.prototype.getStr=function() {
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
				ch=CastlingRights.fileChars[colour][file];

				if(file in CastlingRights._fileToSide) {
					ch=CastlingRights.sideChars[colour][CastlingRights._fileToSide[file]];
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
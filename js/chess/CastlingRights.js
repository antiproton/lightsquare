/*
this object represents the castling rights for both sides

it handles regular notation (kqKQ) as well as the file notation used
in Chess960 FENs (ahAH)
*/

function CastlingRights() {
	this.rightsBySide=[];
	this.rightsByFile=[];

	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var side, colour;

	for(var c=0; c<colours.length; c++) {
		colour=colours[c];

		for(var s=0; s<sides.length; s++) {
			side=sides[s];

			if(!(colour in this.rightsBySide)) {
				this.rightsBySide[colour]=[];
			}

			this.rightsBySide[colour][side]=false;
		}

		for(var file=0; file<8; file++) {
			if(!(colour in this.rightsByFile)) {
				this.rightsByFile[colour]=[];
			}

			this.rightsByFile[colour][file]=false;
		}
	}
}

CastlingRights.MODE_SIDE=0;
CastlingRights.MODE_FILE=1;

CastlingRights._sideChars=[];
CastlingRights._sideChars[WHITE]=[];
CastlingRights._sideChars[BLACK]=[];
CastlingRights._sideChars[WHITE][KINGSIDE]=FEN_WHITE_CASTLE_KS;
CastlingRights._sideChars[WHITE][QUEENSIDE]=FEN_WHITE_CASTLE_QS;
CastlingRights._sideChars[BLACK][KINGSIDE]=FEN_BLACK_CASTLE_KS;
CastlingRights._sideChars[BLACK][QUEENSIDE]=FEN_BLACK_CASTLE_QS;

CastlingRights._fileChars=[];

CastlingRights._fileChars[WHITE]=[
	FEN_WHITE_CASTLE_A,
	FEN_WHITE_CASTLE_B,
	FEN_WHITE_CASTLE_C,
	FEN_WHITE_CASTLE_D,
	FEN_WHITE_CASTLE_E,
	FEN_WHITE_CASTLE_F,
	FEN_WHITE_CASTLE_G,
	FEN_WHITE_CASTLE_H
];

CastlingRights._fileChars[BLACK]=[
	FEN_BLACK_CASTLE_A,
	FEN_BLACK_CASTLE_B,
	FEN_BLACK_CASTLE_C,
	FEN_BLACK_CASTLE_D,
	FEN_BLACK_CASTLE_E,
	FEN_BLACK_CASTLE_F,
	FEN_BLACK_CASTLE_G,
	FEN_BLACK_CASTLE_H
];

CastlingRights._sideFromFile=[];
CastlingRights._sideFromFile[0]=QUEENSIDE;
CastlingRights._sideFromFile[7]=KINGSIDE;

CastlingRights._fileFromSide=[]
CastlingRights._fileFromSide[KINGSIDE]=7;
CastlingRights._fileFromSide[QUEENSIDE]=0;

CastlingRights.prototype.reset=function() {
	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];

	var side, colour;

	for(var i=0; i<colours.length; i++) {
		colour=colours[c];

		for(var j=0; j<sides.length; j++) {
			side=sides[s];

			this.rightsBySide[colour][side]=false;
		}

		for(var file=0; file<8; file++) {
			this.rightsByFile[colour][file]=false;
		}
	}
}

CastlingRights.prototype.set=function(colour, index, allow, mode) {
	mode=mode||CastlingRights.MODE_SIDE;

	switch(mode) {
		case CastlingRights.MODE_SIDE: {
			this.rightsBySide[colour][index]=allow;
			this.rightsByFile[colour][CastlingRights._fileFromSide[index]]=allow;

			break;
		}

		case CastlingRights.MODE_FILE: {
			this.rightsByFile[colour][index]=allow;

			if(index in CastlingRights._sideFromFile) {
				this.rightsBySide[colour][CastlingRights._sideFromFile[index]]=allow;
			}

			break;
		}
	}
}

CastlingRights.prototype.get=function(colour, index, mode) {
	mode=mode||CastlingRights.MODE_SIDE;

	var rights={};

	rights[CastlingRights.MODE_SIDE]=this.rightsBySide[colour][index];
	rights[CastlingRights.MODE_FILE]=this.rightsByFile[colour][index];

	return rights[mode];
}

CastlingRights.prototype.setFenString=function(fenString) {
	this.reset();

	if(fenString!==FEN_NONE) {
		var arr=fenString.split("");
		var ch, lowerChar, upperChar;
		var colour, mode, index;

		for(var i=0; i<arr.length; i++) {
			ch=arr[i];

			lowerChar=ch.toLowerCase();
			upperChar=ch.toUpperCase();

			colour=(ch===upperChar)?WHITE:BLACK;
			mode=(FILES.indexOf(lowerChar)!==-1)?CastlingRights.MODE_FILE:CastlingRights.MODE_SIDE;

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

CastlingRights.prototype.getFenString=function() {
	var colours=[WHITE, BLACK];
	var colour, side, fenChar;
	var rights=[];

	rights[WHITE]=[];
	rights[BLACK]=[];

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		for(var file=0; file<8; file++) {
			if(this.rightsByFile[colour][file]) {
				fenChar=CastlingRights.fileChars[colour][file];

				if(file in CastlingRights._sideFromFile) {
					fenChar=CastlingRights._sideChars[colour][CastlingRights._sideFromFile[file]];
				}

				rights[colour].push(fenChar);
			}
		}
	}

	var fenString=rights[WHITE].join("")+rights[BLACK].join("");

	if(fenString==="") {
		fenString=FEN_NONE;
	}

	return fenString;
}
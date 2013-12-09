/*
this object represents the castling rights for both sides

it handles regular notation (kqKQ) as well as the file notation used
in Chess960 FENs (ahAH)
*/

/*
FIXME this is broken - it will mix up signs from different modes.  it should
really just take a mode in the constructor and leave it at that
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

	if(fenString!==Fen.NONE) {
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
					index=(Fen.BLACK_CASTLE_KS+Fen.BLACK_CASTLE_QS).indexOf(lowerChar);

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
		fenString=Fen.NONE;
	}

	return fenString;
}

CastlingRights.MODE_SIDE=0;
CastlingRights.MODE_FILE=1;

CastlingRights._sideChars=[];
CastlingRights._sideChars[WHITE]=[];
CastlingRights._sideChars[BLACK]=[];
CastlingRights._sideChars[WHITE][KINGSIDE]=Fen.WHITE_CASTLE_KS;
CastlingRights._sideChars[WHITE][QUEENSIDE]=Fen.WHITE_CASTLE_QS;
CastlingRights._sideChars[BLACK][KINGSIDE]=Fen.BLACK_CASTLE_KS;
CastlingRights._sideChars[BLACK][QUEENSIDE]=Fen.BLACK_CASTLE_QS;

CastlingRights._fileChars=[];

CastlingRights._fileChars[WHITE]=[
	Fen.WHITE_CASTLE_A,
	Fen.WHITE_CASTLE_B,
	Fen.WHITE_CASTLE_C,
	Fen.WHITE_CASTLE_D,
	Fen.WHITE_CASTLE_E,
	Fen.WHITE_CASTLE_F,
	Fen.WHITE_CASTLE_G,
	Fen.WHITE_CASTLE_H
];

CastlingRights._fileChars[BLACK]=[
	Fen.BLACK_CASTLE_A,
	Fen.BLACK_CASTLE_B,
	Fen.BLACK_CASTLE_C,
	Fen.BLACK_CASTLE_D,
	Fen.BLACK_CASTLE_E,
	Fen.BLACK_CASTLE_F,
	Fen.BLACK_CASTLE_G,
	Fen.BLACK_CASTLE_H
];

CastlingRights._sideFromFile=[];
CastlingRights._sideFromFile[0]=QUEENSIDE;
CastlingRights._sideFromFile[7]=KINGSIDE;

CastlingRights._fileFromSide=[]
CastlingRights._fileFromSide[KINGSIDE]=7;
CastlingRights._fileFromSide[QUEENSIDE]=0;
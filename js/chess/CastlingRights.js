/*
this handles regular FEN side notation (KQkq) and chess 960 file notation (AHah).
*/

function CastlingRights() {
	this._rightsByFile=[];
	this._rightsByFile[WHITE]=[];
	this._rightsByFile[BLACK]=[];

	this.reset();
}

CastlingRights.prototype.reset=function() {
	for(var file=0; file<8; file++) {
		this._rightsByFile[WHITE][file]=false;
		this._rightsByFile[BLACK][file]=false;
	}
}

CastlingRights.prototype.setByFile=function(colour, file, allow) {
	this._rightsByFile[colour][file]=allow;
}

CastlingRights.prototype.setBySide=function(colour, side, allow) {
	this._rightsByFile[colour][CastlingRights._fileFromSide[side]]=allow;
}

CastlingRights.prototype.getByFile=function(colour, file) {
	return this._rightsByFile[colour][file];
}

CastlingRights.prototype.getBySide=function(colour, side) {
	return this._rightsByFile[colour][CastlingRights._fileFromSide[side]];
}

CastlingRights.prototype.setFenString=function(fenString) {
	this.reset();

	if(fenString!==Fen.NONE) {
		var fenChars=fenString.split("");
		var fenChar, fenCharLower, fenCharUpper;
		var colour, file, side;
		var sides={};

		sides[Fen.getPieceChar(WHITE_KING)]=KINGSIDE;
		sides[Fen.getPieceChar(WHITE_QUEEN)]=QUEENSIDE;

		for(var i=0; i<fenChars.length; i++) {
			fenChar=fenChars[i];
			fenCharLower=fenChar.toLowerCase();
			fenCharUpper=fenChar.toUpperCase();
			colour=(fenChar===fenCharUpper?WHITE:BLACK);

			if(fenCharUpper in sides) {
				file=CastlingRights._fileFromSide[sides[fenCharUpper]];
			}

			else {
				file=FILES.indexOf(fenCharLower);
			}

			this.setByFile(colour, file, true);
		}
	}
}

CastlingRights.prototype.getFenStringByFile=function() {
	var colours=[WHITE, BLACK];
	var colour;
	var fenString="";

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		for(var file=0; file<8; file++) {
			if(this.getByFile(colour, file)) {
				fenString+=CastlingRights._getFileChar(colour, file);
			}
		}
	}

	if(fenString==="") {
		fenString=Fen.NONE;
	}

	return fenString;
}

CastlingRights.prototype.getFenStringBySide=function() {
	var colours=[WHITE, BLACK];
	var sides=[KINGSIDE, QUEENSIDE];
	var colour, side;
	var fenString="";

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		for(var j=0; j<sides.length; j++) {
			side=sides[j];

			if(this.getBySide(colour, side)) {
				fenString+=CastlingRights._getSideChar(colour, side);
			}
		}
	}

	if(fenString==="") {
		fenString=Fen.NONE;
	}

	return fenString;
}

CastlingRights._getSideChar=function(colour, side) {
	var pieceTypes=[]

	pieceTypes[KINGSIDE]=KING;
	pieceTypes[QUEENSIDE]=QUEEN;

	return Fen.getPieceChar(Util.getPiece(pieceTypes[side], colour));
}

CastlingRights._getFileChar=function(colour, file) {
	var fenChar=FILES.charAt(file);

	if(colour===WHITE) {
		fenChar=fenChar.toUpperCase();
	}

	return fenChar;
}

CastlingRights._fileFromSide=[];
CastlingRights._fileFromSide[KINGSIDE]=7;
CastlingRights._fileFromSide[QUEENSIDE]=0;
/*
this handles regular FEN side notation (KQkq) and chess 960 file notation (AHah).
*/

function CastlingRights() {
	this._rightsByFile=[];
	this._rightsByFile[WHITE]=[];
	this._rightsByFile[BLACK]=[];

	for(var file=0; file<8; file++) {
		this._rightsByFile[WHITE][file]=false;
		this._rightsByFile[BLACK][file]=false;
	}
}

CastlingRights.prototype.reset=function() {
	for(var file=0; file<8; file++) {
		this.setByFile(WHITE, file, false);
		this.setByFile(BLACK, file, false);
	}
}

CastlingRights.prototype.setByFile=function(colour, file, allow) {
	this._rightsByFile[colour][file]=allow;
}

CastlingRights.prototype.setBySide=function(colour, side, allow) {
	this._rightsByFile[colour][CastlingRights._fileFromSide[index]]=allow;
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
		var fenChar;
		var colour, file, side;

		for(var i=0; i<fenChars.length; i++) {
			fenChar=fenChars[i];
			colour=(fenChar===fenChar.toUpperCase()?WHITE:BLACK);
			side=CastlingRights._sideChars[colour].indexOf(fenChar);

			if(side!==-1) {
				file=CastlingRights._fileFromSide[side];
			}

			else {
				file=CastlingRights._fileChars[colour].indexOf(fenChar);
			}

			this.setByFile(colour, file, true);
		}
	}
}

CastlingRights._getFenString=function(bySide) {
	var colours=[WHITE, BLACK];
	var colour;
	var fenString="";
	var side;

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		for(var file=0; file<8; file++) {
			if(this.getByFile(colour, file)) {
				if(bySide) {
					side=CastlingRights._fileFromSide.indexOf(file);

					if(side!==-1) {
						fenString+=CastlingRights._getSideChar(colour, side);
					}
				}

				else {
					fenString+=CastlingRights._getFileChar(colour, file);
				}
			}
		}
	}

	if(fenString==="") {
		fenString=Fen.NONE;
	}

	return fenString;
}

CastlingRights.prototype.getFenStringByFile=function() {
	return CastlingRights._getFenString(false);
}

CastlingRights.prototype.getFenStringBySide=function() {
	return CastlingRights._getFenString(true);
}

CastlingRights._getSideChar=function(colour, side) {
	var pieceTypes=[];

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
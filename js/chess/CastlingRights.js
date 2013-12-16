define(function(require) {
	var Fen=require("./Fen");
	var Chess=require("./Chess");
	var Piece=require("./Piece");

	function CastlingRights() {
		this._rightsByFile=[];
		this._rightsByFile[Piece.WHITE]=[];
		this._rightsByFile[Piece.BLACK]=[];

		this.reset();
	}

	CastlingRights.prototype.reset=function() {
		for(var file=0; file<8; file++) {
			this._rightsByFile[Piece.WHITE][file]=false;
			this._rightsByFile[Piece.BLACK][file]=false;
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

			sides[Fen.getPieceChar(Piece.WHITE_KING)]=CastlingRights.KINGSIDE;
			sides[Fen.getPieceChar(Piece.WHITE_QUEEN)]=CastlingRights.QUEENSIDE;

			for(var i=0; i<fenChars.length; i++) {
				fenChar=fenChars[i];
				fenCharLower=fenChar.toLowerCase();
				fenCharUpper=fenChar.toUpperCase();
				colour=(fenChar===fenCharUpper?Piece.WHITE:Piece.BLACK);

				if(fenCharUpper in sides) {
					file=CastlingRights._fileFromSide[sides[fenCharUpper]];
				}

				else {
					file=Chess.FILES.indexOf(fenCharLower);
				}

				this.setByFile(colour, file, true);
			}
		}
	}

	CastlingRights.prototype.getFenStringByFile=function() {
		var colours=[Piece.WHITE, Piece.BLACK];
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
		var colours=[Piece.WHITE, Piece.BLACK];
		var sides=[CastlingRights.KINGSIDE, CastlingRights.QUEENSIDE];
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

		pieceTypes[CastlingRights.KINGSIDE]=Chess.KING;
		pieceTypes[CastlingRights.QUEENSIDE]=Chess.QUEEN;

		return Fen.getPieceChar(Piece.getPiece(pieceTypes[side], colour));
	}

	CastlingRights._getFileChar=function(colour, file) {
		var fenChar=Chess.FILES.charAt(file);

		if(colour===Piece.WHITE) {
			fenChar=fenChar.toUpperCase();
		}

		return fenChar;
	}

	CastlingRights._fileFromSide=[];
	CastlingRights._fileFromSide[CastlingRights.KINGSIDE]=7;
	CastlingRights._fileFromSide[CastlingRights.QUEENSIDE]=0;

	return CastlingRights;
});
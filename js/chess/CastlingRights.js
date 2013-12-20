define(function(require) {
	var Fen=require("chess/Fen");
	var Chess=require("chess/Chess");
	var Piece=require("chess/Piece");

	function Class() {
		this._rightsByFile=[];
		this._rightsByFile[Piece.WHITE]=[];
		this._rightsByFile[Piece.BLACK]=[];

		this.reset();
	}

	Class.prototype.reset=function() {
		for(var file=0; file<8; file++) {
			this._rightsByFile[Piece.WHITE][file]=false;
			this._rightsByFile[Piece.BLACK][file]=false;
		}
	}

	Class.prototype.setByFile=function(colour, file, allow) {
		this._rightsByFile[colour][file]=allow;
	}

	Class.prototype.setBySide=function(colour, side, allow) {
		this._rightsByFile[colour][Class._fileFromSide[side]]=allow;
	}

	Class.prototype.getByFile=function(colour, file) {
		return this._rightsByFile[colour][file];
	}

	Class.prototype.getBySide=function(colour, side) {
		return this._rightsByFile[colour][Class._fileFromSide[side]];
	}

	Class.prototype.setFenString=function(fenString) {
		this.reset();

		if(fenString!==Fen.NONE) {
			var fenChars=fenString.split("");
			var fenChar, fenCharLower, fenCharUpper;
			var colour, file, side;
			var sides={};

			sides[Fen.getPieceChar(Piece.WHITE_KING)]=Class.KINGSIDE;
			sides[Fen.getPieceChar(Piece.WHITE_QUEEN)]=Class.QUEENSIDE;

			for(var i=0; i<fenChars.length; i++) {
				fenChar=fenChars[i];
				fenCharLower=fenChar.toLowerCase();
				fenCharUpper=fenChar.toUpperCase();
				colour=(fenChar===fenCharUpper?Piece.WHITE:Piece.BLACK);

				if(fenCharUpper in sides) {
					file=Class._fileFromSide[sides[fenCharUpper]];
				}

				else {
					file=Chess.FILES.indexOf(fenCharLower);
				}

				this.setByFile(colour, file, true);
			}
		}
	}

	Class.prototype.getFenStringByFile=function() {
		var colours=[Piece.WHITE, Piece.BLACK];
		var colour;
		var fenString="";

		for(var i=0; i<colours.length; i++) {
			colour=colours[i];

			for(var file=0; file<8; file++) {
				if(this.getByFile(colour, file)) {
					fenString+=Class._getFileChar(colour, file);
				}
			}
		}

		if(fenString==="") {
			fenString=Fen.NONE;
		}

		return fenString;
	}

	Class.prototype.getFenStringBySide=function() {
		var colours=[Piece.WHITE, Piece.BLACK];
		var sides=[Class.KINGSIDE, Class.QUEENSIDE];
		var colour, side;
		var fenString="";

		for(var i=0; i<colours.length; i++) {
			colour=colours[i];

			for(var j=0; j<sides.length; j++) {
				side=sides[j];

				if(this.getBySide(colour, side)) {
					fenString+=Class._getSideChar(colour, side);
				}
			}
		}

		if(fenString==="") {
			fenString=Fen.NONE;
		}

		return fenString;
	}

	Class._getSideChar=function(colour, side) {
		var pieceTypes=[]

		pieceTypes[Class.KINGSIDE]=Piece.KING;
		pieceTypes[Class.QUEENSIDE]=Piece.QUEEN;

		return Fen.getPieceChar(Piece.getPiece(pieceTypes[side], colour));
	}

	Class._getFileChar=function(colour, file) {
		var fenChar=Chess.FILES.charAt(file);

		if(colour===Piece.WHITE) {
			fenChar=fenChar.toUpperCase();
		}

		return fenChar;
	}

	Class._fileFromSide=[];
	Class._fileFromSide[Class.KINGSIDE]=7;
	Class._fileFromSide[Class.QUEENSIDE]=0;

	return Class;
});
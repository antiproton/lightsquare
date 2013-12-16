define(function(require) {
	var Fen=require("./Fen");
	var Piece=require("./Piece");

	var Colour={
		getCode: function(colour) {
			if(colour in this._codeFromFen) {
				return this._codeFromFen[colour];
			}

			if(colour in this._codeFromName) {
				return this._codeFromName[colour];
			}

			else {
				return colour;
			}
		},

		getFen: function(colour) {
			return this._fenFromCode[this.getCode(colour)];
		},

		getName: function(colour) {
			return this._nameFromCode[this.getCode(colour)];
		}
	};

	Colour._codeFromFen={};
	Colour._codeFromFen[Fen.ACTIVE_WHITE]=Piece.WHITE;
	Colour._codeFromFen[Fen.ACTIVE_BLACK]=Piece.BLACK;

	Colour._fenFromCode=[];
	Colour._fenFromCode[Piece.WHITE]=Fen.ACTIVE_WHITE;
	Colour._fenFromCode[Piece.BLACK]=Fen.ACTIVE_BLACK;

	Colour._codeFromName={
		"white": Piece.WHITE,
		"black": Piece.BLACK
	};

	Colour._nameFromCode=[];
	Colour._nameFromCode[Piece.WHITE]="white";
	Colour._nameFromCode[Piece.BLACK]="black";

	return Colour;
});
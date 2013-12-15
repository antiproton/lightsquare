define(function(require) {
	var Fen=require("./Fen");
	
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
	Colour._codeFromFen[Fen.ACTIVE_WHITE]=WHITE;
	Colour._codeFromFen[Fen.ACTIVE_BLACK]=BLACK;

	Colour._fenFromCode=[];
	Colour._fenFromCode[WHITE]=Fen.ACTIVE_WHITE;
	Colour._fenFromCode[BLACK]=Fen.ACTIVE_BLACK;

	Colour._codeFromName={
		"white": WHITE,
		"black": BLACK
	};

	Colour._nameFromCode=[];
	Colour._nameFromCode[WHITE]="white";
	Colour._nameFromCode[BLACK]="black";

	return Colour;
});
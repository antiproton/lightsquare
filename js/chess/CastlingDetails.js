/*
NOTE this could really do with being ditched, same for the PHP version but
this is worse as the sign/side indexing can't be made explicit without

arr=[]
arr[KINGSIDE] .. arr[QUEENSIDE] etc
*/

function CastlingDetails(fs, ts) {
	this.isValid=false;

	var kingStartPos=[4, 60];
	var kingEndPos;
	var n, side, o, rook;

	for(var i=0; i<kingStartPos.length; i++) {
		n=kingStartPos[i];

		if(fs===n) {
			kingEndPos=[ //indexed by side
				n+2,
				n-2
			];

			for(var j=0; j<kingEndPos.length; j++) {
				side=j;
				o=kingEndPos[side];

				if(ts===o) {
					rook=[
						[o+1, o-1],
						[o-2, o+1]
					];

					this.side=side;
					this.rookStartPos=rook[side][0];
					this.rookEndPos=rook[side][1];
					this.sign=CastlingDetails.signs[side];
					this.isValid=true;
				}
			}
		}
	}
}

CastlingDetails.signs=[
	SIGN_CASTLE_KS,
	SIGN_CASTLE_QS
];
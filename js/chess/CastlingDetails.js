/*
NOTE this could really do with being ditched, same for the PHP version but
this is worse as the sign/side indexing can't be made explicit without

arr=[]
arr[KINGSIDE] .. arr[QUEENSIDE] etc
*/

function CastlingDetails(fs, ts) {
	this.Valid=false;

	var king_start_pos=[4, 60];
	var king_end_pos;
	var n, side, o, rook;

	for(var i=0; i<king_start_pos.length; i++) {
		n=king_start_pos[i];

		if(fs===n) {
			king_end_pos=[ //indexed by side
				n+2,
				n-2
			];

			for(var j=0; j<king_end_pos.length; j++) {
				side=j;
				o=king_end_pos[side];

				if(ts===o) {
					rook=[
						[o+1, o-1],
						[o-2, o+1]
					];

					this.Side=side;
					this.RookStartPos=rook[side][0];
					this.RookEndPos=rook[side][1];
					this.Sign=CastlingDetails.Signs[side];
					this.Valid=true;
				}
			}
		}
	}
}

CastlingDetails.Signs=[
	SIGN_CASTLE_KS,
	SIGN_CASTLE_QS
];
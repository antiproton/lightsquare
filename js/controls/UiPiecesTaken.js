function UiPiecesTaken(parent) {
	Control.implement(this, parent, true);

	this.view_as=WHITE;
	this.square_size=20;
	this.img_dir="/board/piece";
	this.piece_style=Base.App.User.Prefs.PieceStyle.Get();

	this.ViewAs=new Property(this, function() {
		return this.view_as;
	}, function(value) {
		this.view_as=value;
		this.UpdateHtml();
	});

	/*
	PiecesTaken - a list of the number of each type of piece stored
	(index by actual piece integers, e.g. 9 for black pawn)

	divs_occupied - the pawn divs can accept other pieces if the
	divs for that piece are full already, so divs_occupied[WHITE_PAWN]
	might be more than PiecesTaken[WHITE_PAWN]
	*/

	this.PiecesTaken=[];
	this.divs_occupied=[];
	this.pieces_list=[];
	this.scores=[];

	this.divs=[]; //general container for keeping a list of piece divs

	this.reset_counters();
	this.reset_scores();

	this.html_is_setup=false;
	this.SetupHtml();
}

UiPiecesTaken.prototype.SetupHtml=function() {
	this.border=div(this.Node);
	this.inner=div(this.border);

	//Dom.Style(this.border, {
	//	//border: "1px solid #cfcfcf",
	//	borderRadius: 3,
	//	backgroundColor: "#ededed"
	//});

	Dom.Style(this.inner, {
		margin: "0 auto"
	});

	var colours=[WHITE, BLACK];
	var colour, type;

	var piece_types=[KNIGHT, BISHOP, ROOK, QUEEN];

	this.player_divs=[];
	this.piece_divs=[];
	this.score_divs=[];

	var pawns_container, pieces_container, tmp; //2 rows

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		this.player_divs[colour]=div(this.inner);

		Dom.Style(this.player_divs[colour], {
			paddingTop: 6
		});

		pawns_container=div(this.player_divs[colour]);
		pieces_container=div(this.player_divs[colour]);
		this.score_divs[colour]=div(this.player_divs[colour]);

		Dom.Style(this.score_divs[colour], {
			textAlign: "center",
			fontSize: 11,
			padding: "4px 0 4px 0"
		});

		this.piece_divs[colour]=[];

		for(var j=0; j<piece_types.length; j++) {
			type=piece_types[j];

			this.piece_divs[colour][type]=[];

			for(var k=0; k<2; k++) {
				tmp=div(pieces_container);
				this.piece_divs[colour][type][k]=tmp;
				this.divs.push(tmp);
			}
		}

		cb(pieces_container);

		this.piece_divs[colour][PAWN]=[];

		for(var k=0; k<8; k++) {
			tmp=div(pawns_container);
			this.piece_divs[colour][PAWN][k]=tmp;
			this.divs.push(tmp);
		}

		cb(pawns_container);
	}

	for(var i=0; i<this.divs.length; i++) {
		Dom.Style(this.divs[i], {
			cssFloat: "left"
		});
	}

	this.html_is_setup=true;
	this.UpdateHtml();
}

UiPiecesTaken.prototype.UpdateHtml=function() {
	Dom.Style(this.inner, {
		width: this.square_size*8
	});

	for(var i=0; i<this.divs.length; i++) {
		Dom.Style(this.divs[i], {
			height: this.square_size
		});
	}

	var list=[];

	for(var i=0; i<this.pieces_list.length; i++) {
		list.push(this.pieces_list[i]);
	}

	this.Clear();

	for(var i=0; i<list.length; i++) {
		this.Add(list[i]);
	}

	this.update_scores();
}

UiPiecesTaken.prototype.Clear=function() {
	this.reset_divs();
	this.reset_counters();
	this.reset_scores();
	this.update_scores();
}

UiPiecesTaken.prototype.Add=function(pc) {
	var piece=new Piece(pc);
	var rel_colour=this.rel_colour(piece.Colour);

	if(piece.Type===PAWN) {
		this.set_piece_div(this.piece_divs[rel_colour][piece.Type][this.divs_occupied[pc]], pc);
		this.divs_occupied[pc]++;
	}

	else { //there are 2 slots for each other piece type, so promoted pieces might have to be added to the pawns
		if(this.divs_occupied[pc]>=2) {
			var pawn=Util.piece(PAWN, piece.Colour);

			this.set_piece_div(this.piece_divs[rel_colour][PAWN][this.divs_occupied[pawn]], pc);
			this.divs_occupied[pawn]++;
		}

		else {
			this.set_piece_div(this.piece_divs[rel_colour][piece.Type][this.divs_occupied[pc]], pc);
			this.divs_occupied[pc]++;
		}
	}

	this.PiecesTaken[pc]++;
	this.pieces_list.push(pc);
	this.scores[piece.Colour]+=Piece.Values[piece.Type];

	this.update_scores();
}

UiPiecesTaken.prototype.Remove=function(pc) {
	if(this.PiecesTaken[pc]>0) {
		var piece=new Piece(pc);

		//TODO

		this.PiecesTaken[pc]--;
	}
}

UiPiecesTaken.prototype.set_piece_div=function(div, pc) {
	var width=(pc===SQ_EMPTY?0:this.square_size);
	var bgimg=(pc===SQ_EMPTY?"none":Base.App.CssImg(this.img_dir+"/"+this.piece_style+"/"+this.square_size+"/"+Fen.get_piece_char(pc)+".png"));

	Dom.Style(div, {
		width: width,
		backgroundImage: bgimg
	});
}

UiPiecesTaken.prototype.rel_colour=function(colour) {
	return (this.view_as===WHITE?colour:Util.opp_colour(colour));
}

UiPiecesTaken.prototype.reset_divs=function() {
	for(var i=0; i<this.divs.length; i++) {
		this.set_piece_div(this.divs[i], SQ_EMPTY);
	}
}

UiPiecesTaken.prototype.reset_counters=function() {
	var colours=[WHITE, BLACK];
	var types=[PAWN, KNIGHT, BISHOP, ROOK, QUEEN];
	var type, colour;

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];

		for(var j=0; j<types.length; j++) {
			type=types[j];

			this.PiecesTaken[Util.piece(type, colour)]=0;
			this.divs_occupied[Util.piece(type, colour)]=0;
		}
	}

	this.pieces_list=[];
}

UiPiecesTaken.prototype.reset_scores=function() {
	var colours=[WHITE, BLACK];
	var type, colour;

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];
		this.scores[colour]=0;
	}
}

UiPiecesTaken.prototype.update_scores=function() {
	var colours=[WHITE, BLACK];
	var colour, rel_colour;
	var str="";

	for(var i=0; i<colours.length; i++) {
		colour=colours[i];
		rel_colour=this.rel_colour(colour);

		if(this.scores[colour]>0) {
			str=this.scores[colour];
		}

		this.score_divs[rel_colour].innerHTML=str;
	}
}
function UiBoardSquare() {

}

UiBoardSquare.prototype.setPiece=function(piece) {
	var bgimg="none";

	if(piece!==SQ_EMPTY) {
		bgimg="url("+this.img_dir_piece+"/"+this._pieceStyle+"/"+this._squareSize+"/"+Fen.getPieceChar(piece)+".png)";
	}

	if(this._uiSquares[square].node.style.backgroundImage!==bgimg) { //performance is noticeably better with this check
		this._uiSquares[square].node.style.backgroundImage=bgimg;
	}
}

UiBoardSquare.prototype.resetPosition=function() {
	style(this.node, {
		top: 0,
		left: 0
	});
}

UiBoardSquare.prototype.setPosition=function(x, y) {

	var os=getoffsets(square.container);

	style(square.node, {
		top: y-os[Y],
		left: x-os[X]
	});
}

UiBoardSquare.prototype.setContainerPosition=function(x, y) {

	style(square.container, {
		top: y,
		left: x
	});
}

/*
	for(var r=0; r<8; r++) {
		for(var f=0; f<8; f++) {
			sq_outer=div(this.board_div);
			highlight=div(sq_outer);
			sq_inner=div(sq_outer);

			style(sq_outer, {
				position: "absolute"
			});

			style(sq_inner, {
				position: "absolute",
				zIndex: UiBoard.SQUARE_ZINDEX_NORMAL
			});

			style(highlight, {
				position: "absolute",
				zIndex: UiBoard.SQUARE_ZINDEX_BELOW,
				borderStyle: "solid",
				borderColor: "transparent",
				visibility: "hidden"
			});

			sq_inner.addEventListener("mousedown", function(e) {
				self._boardMouseDown(e);
			});

			sq_inner.addEventListener("mouseup", function(e) {
				self._boardMouseUp(e);
			});

			square={
				container: sq_outer,
				node: sq_inner,
				highlight: highlight
			};

			this._uiSquares.push(square);
		}
	}
*/

UiBoardSquare.prototype.setSize=function(size) {
	//container
	//node
			style(uiSquare.highlight, {
			width: this._squareSize-(this._squareHighlightBorder*2),
			height: this._squareSize-(this._squareHighlightBorder*2),
			borderWidth: this._squareHighlightBorder
		});
}
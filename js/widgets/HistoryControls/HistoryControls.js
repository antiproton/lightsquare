function HistoryControls(parent) {
	Control.implement(this, parent);

	this.history=null;
	this._imgDir="/img/buttons";

	this._setupHtml();
}

HistoryControls.prototype._setupHtml=function() {
	this._inner=div(this.node);

	this.buttonFirst=new SpriteButton(this._inner, 23, 20, this._imgDir+"/hist_ctrl_first.png");
	this.buttonPrevFive=new SpriteButton(this._inner, 23, 20, this._imgDir+"/hist_ctrl_prev5.png");
	this.buttonPrev=new SpriteButton(this._inner, 23, 20, this._imgDir+"/hist_ctrl_prev.png");
	this.buttonNext=new SpriteButton(this._inner, 23, 20, this._imgDir+"/hist_ctrl_next.png");
	this.buttonNextFive=new SpriteButton(this._inner, 23, 20, this._imgDir+"/hist_ctrl_next5.png");
	this.buttonLast=new SpriteButton(this._inner, 23, 20, this._imgDir+"/hist_ctrl_last.png");

	this.buttonFirst.Click.addHandler(this, function() {
		if(this.history!==null) {
			if(this.history.selectedMove===null && this.history.mainLine.moveList.length>0) {
				this.history.select(this.history.mainLine.firstMove);
			}

			else {
				this.history.select(null);
			}
		}
	});

	this.buttonPrevFive.Click.addHandler(this, function() {
		if(this.history!==null) {
			if(this.history.mainLine.moveList.length>0) {
				for(var i=0; i<5; i++) {
					if(this.history.selectedMove!==null && this.history.selectedMove.previousMove!==null) {
						this.history.select(this.history.selectedMove.previousMove);
					}

					else if(this.history.selectedMove!==null && this.history.selectedMove.variation!==this.history.mainLine) {
						this.history.select(this.history.selectedMove.variation.branchMove);

						break;
					}

					else {
						this.history.select(null);

						break;
					}
				}
			}
		}
	});

	this.buttonPrev.Click.addHandler(this, function() {
		if(this.history!==null) {
			if(this.history.selectedMove!==null && this.history.selectedMove.previousMove!==null) {
				this.history.select(this.history.selectedMove.previousMove);
			}

			else if(this.history.selectedMove!==null && this.history.selectedMove.variation!==this.history.mainLine) {
				this.history.select(this.history.selectedMove.variation.branchMove);
			}

			else {
				this.history.select(null);
			}
		}
	});

	this.buttonNext.Click.addHandler(this, function() {
		if(this.history!==null) {
			if(this.history.selectedMove===null) {
				if(this.history.mainLine.moveList.length>0) {
					this.history.select(this.history.mainLine.firstMove);
				}
			}

			else if(this.history.selectedMove.nextMove!==null) {
				this.history.select(this.history.selectedMove.nextMove);
			}
		}
	});

	this.buttonNextFive.Click.addHandler(this, function() {
		if(this.history!==null) {
			if(this.history.selectedMove===null) {
				if(this.history.mainLine.moveList.length>0) {
					this.history.select(this.history.mainLine.firstMove);
				}
			}

			if(this.history.selectedMove!==null) {
				var i=0;

				while(i<5 && this.history.selectedMove.nextMove!==null) {
					this.history.select(this.history.selectedMove.nextMove);
					i++;
				}
			}
		}
	});

	this.buttonLast.Click.addHandler(this, function() {
		if(this.history!==null) {
			if(this.history.mainLine.lastMove!==null) {
				this.history.select(this.history.mainLine.lastMove);
			}
		}
	});
}
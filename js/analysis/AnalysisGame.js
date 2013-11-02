function AnalysisGame(board, history) {
	IGameCommon.implement(this, board, history);

	this.ui_is_setup=false;
	this.init_events();

	this.Board.SelectPiece.AddHandler(this, function(data) {
		if(this.Position.Active!==Util.colour(data.Piece)) {
			data.Cancel=true;
		}
	});

	this.Board.PieceSelected.AddHandler(this, function(data) {
		if(this.Board.MoveInfo.Mode===UiBoard.MOVE_MODE_CLICK_CLICK) {
			this.Board.HiliteSelected(data.Sq);
		}
	});

	this.Board.Deselected.AddHandler(this, function() {
		this.Board.UnhiliteSelected();
	});

	this.Board.UserMove.AddHandler(this, function(data) {
		this.UserMove(data.From, data.To);
	});

	this.Board.SetFen(this.Position.GetFen());

	IGameWithUiBoard.implement(this);
}

AnalysisGame.prototype.init_events=function() {
	this.GameOver=new Event(this);
}

AnalysisGame.prototype.init_props=function() {
	//use live game props?
}

AnalysisGame.prototype.UserMove=function(fs, ts, promote_to) {
	var promotion=false;
	var piece=this.Position.Board[fs];

	if(Util.type(piece)===PAWN && (Util.y(ts)===0 || Util.y(ts)===7) && !promote_to) {
		promotion=true;

		this.Board.PromoteDialog.Show();

		this.Board.PromoteDialog.PieceSelected.AddHandler(this, function(data) {
			this.UserMove(fs, ts, data.Piece);
			this.Board.PromoteDialog.Hide();

			return true;
		});
	}

	if(promote_to || !promotion) {
		this.Move(fs, ts, promote_to);
	}
}

AnalysisGame.prototype.game_over=function() {
	IGameCommon.prototype.game_over.call(this);
	this.GameOver.Fire();
}
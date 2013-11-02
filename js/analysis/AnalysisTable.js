/*
TODO give this Load, Save etc like a LiveTable

should only fire Loaded if it has loaded one from the server
*/

function AnalysisTable(parent) {
	Control.implement(this, parent, true);

	this.html_is_setup=false;

	this.StartingPosBestMove=null;
	this.StartingPosScore=null;
	this.StartingPosScoreType=null;

	this.init_props();
	this.init_events();

	this.SetupHtml();

	this.init_game();
}

AnalysisTable.prototype.init_events=function() {
	this.Update=new Event(this);
	this.UiLoaded=new Event(this);
	this.Loaded=new Event(this);
	this.Dead=new Event(this);
}

AnalysisTable.prototype.init_props=function() {

}

AnalysisTable.prototype.init_game=function() {
	this.Game=new AnalysisGame(this.Board, this.History);

	this.TextBoxFen.Value.Set(this.Game.Position.GetFen());

	this.Game.Moved.AddHandler(this, function() {
		this.TextBoxFen.Value.Set(this.Game.Position.GetFen());
	});

	//TODO update this in other circumstances as well (piece dropped from piecestore etc)
}

AnalysisTable.prototype.SetupHtml=function() {
	var tmpdiv, container;
	var cb;

	container=div(this.Node);

	Dom.Style(container, {
		padding: "1em 0"
	});

	this.containers={
		board: div(container),
		panel: div(container)
	};

	this.inner_containers={
		board: div(this.containers.board),
		panel: div(this.containers.panel)
	};

	for(var p in this.containers) {
		tmpdiv=this.containers[p];

		Dom.Style(tmpdiv, {
			cssFloat: "left"
		});
	}

	cb=div(container);
	container.appendChild(cb);

	Dom.Style(cb, {
		clear: "both"
	});

	Dom.Style(this.inner_containers.panel, {
		paddingLeft: 5
	});

	//board

	tmpdiv=div(this.inner_containers.board);
	this.Board=new UiBoard(tmpdiv);

	this.Board.ShowCoords.Set(true);
	this.Board.ContainerBorder.Set(false);

	tmpdiv=div(this.inner_containers.board);

	Dom.Style(tmpdiv, {
		marginTop: ".3em",
		marginLeft: "1em"
	});

	this.ButtonFlipBoard=new Button(tmpdiv, "Flip board");

	this.ButtonFlipBoard.Click.AddHandler(this, function() {
		this.Board.ViewAs.Set(Util.opp_colour(this.Board.ViewAs.Get()));
	});

	//history

	tmpdiv=div(this.inner_containers.panel);
	this.History=new UiHistoryTextView(tmpdiv);

	this.History.SelectedMoveChanged.AddHandler(this, function() {
		var move=this.History.SelectedMove;

		if(move!==null) {
			this.TextBoxFen.Value.Set(move.Fen);
		}

		else {
			this.TextBoxFen.Value.Set(this.Game.StartingPosition.GetFen());
		}

		if(move!==null && move.EngineBestMove!==null && move.EngineEvaluation!==null) {
			this.SetAnalysisResultMove(move);
		}

		else if(move==null && this.StartingPosBestMove!==null && this.StartingPosEvaluation!==null) {
			this.SetAnalysisResultStartingPos();
		}
	});

	//history controls

	tmpdiv=div(this.inner_containers.panel);
	this.HistoryControls=new HistoryControls(tmpdiv);
	this.HistoryControls.History=this.History;

	//fen box

	container=div(this.inner_containers.panel);
	tmpdiv=div(container);
	var fen_label=new Label(tmpdiv, "FEN");

	tmpdiv=div(container);

	this.TextBoxFen=new TextBox(tmpdiv);

	this.TextBoxFen.TextChanged.AddHandler(this, function(data) {
		if(data.OldValue!==data.NewValue) {
			this.Game.SetStartingFen(this.TextBoxFen.Value.Get());
		}
	});

	this.TextBoxFen.Width.Set("100%");

	Dom.Style(container, {
		marginTop: "1em"
	});

	this.ContainerAnalyse=new Container(this.inner_containers.panel);

	//move time slider

	tmpdiv=div(this.ContainerAnalyse.Node);

	Dom.Style(tmpdiv, {
		marginTop: "1em"
	});

	this.LabelMovetime=new Label(tmpdiv, "Analysis time (1-5 seconds):");

	tmpdiv=div(this.ContainerAnalyse.Node);

	this.SliderMovetime=new Slider(tmpdiv, 1, 5, "1", "5");

	//analyse button

	tmpdiv=div(this.ContainerAnalyse.Node);

	this.ButtonAnalyse=new Button(tmpdiv, "Analyse");

	this.ButtonAnalyse.Click.AddHandler(this, function() {
		var fen=this.Game.Position.GetFen();
		var move=this.History.SelectedMove;
		var pos=new Position(fen);

		this.ButtonAnalyse.Disable();
		this.ButtonAnalyse.Text.Set("Please wait...");

		Xhr.QueryAsync(ap("/xhr/analyse.php"), function(response) {
			var score=response["score"];

			if(pos.Active===BLACK) { //the engine gives the score for the active player; we want the score for white
				score=-score;
			}

			this.ButtonAnalyse.Enable();
			this.ButtonAnalyse.Text.Set("Analyse");

			if(move!==null) {
				if(response["move"]!=="(none)") {
					this.History.SelectedMove.EngineBestMove=this.get_move_label(response["move"]);
				}

				this.History.SelectedMove.EngineScore=parseInt(score);
				this.History.SelectedMove.EngineScoreType=response["score_type"];
				this.SetAnalysisResultMove(move);
			}

			else {
				if(response["move"]!=="(none)") {
					this.StartingPosBestMove=this.get_move_label(response["move"]);
				}

				this.StartingPosScore=parseFloat(score);
				this.StartingPosScoreType=response["score_type"];
				this.SetAnalysisResultStartingPos();
			}
		}, {
			"fen": fen,
			"movetime": this.SliderMovetime.Value.Get()*1000
		}, this);
	});

	//analyse results

	container=div(this.ContainerAnalyse.Node);

	//this.ContainerAnalyse.Hide();

	Dom.Style(container, {
		marginTop: "1em"
	});

	tmpdiv=div(container);
	this.LabelAnalysisTitle=new Label(tmpdiv);

	Dom.Style(this.LabelAnalysisTitle.Node, {
		fontWeight: "bold",
		fontSize: ".9em"
	});

	tmpdiv=div(container);
	this.LabelAnalysisMove=new Label(tmpdiv);

	Dom.Style(tmpdiv, {
		marginTop: ".6em"
	});

	tmpdiv=div(container);
	this.LabelAnalysisEval=new Label(tmpdiv);

	this.setup_options_panel();

	this.html_is_setup=true;
	this.UpdateHtml();

	this.UiLoaded.Fire();
}

AnalysisTable.prototype.UpdateHtml=function(dont_invalidate) {
	if(this.html_is_setup) {
		this.UiUpdate.Fire();
	}
}

AnalysisTable.prototype.setup_options_panel=function() {
	//
}

AnalysisTable.prototype.SetAnalysisResultMove=function(move) {
	var label="(none)";

	if(move.EngineBestMove!==null) {
		label=move.EngineBestMove;
	}

	this.LabelAnalysisTitle.Text.Set("Analysis at move "+move.GetFullLabel()+":");
	this.LabelAnalysisMove.Text.Set("Best move: "+label);

	switch(move.EngineScoreType) {
		case "cp": {
			this.LabelAnalysisEval.Text.Set("Evaluation: "+this.format_eval(move.EngineScore));

			break;
		}

		case "mate": {
			this.LabelAnalysisEval.Text.Set("Evaluation: mate in "+move.EngineScore);

			break;
		}
	}
}

AnalysisTable.prototype.SetAnalysisResultStartingPos=function() {
	var label="(none)";

	if(this.StartingPosBestMove!==null) {
		label=this.StartingPosBestMove;
	}

	this.LabelAnalysisTitle.Text.Set("Analysis at starting position:");
	this.LabelAnalysisMove.Text.Set("Best move: "+label);

	switch(this.StartingPosScoreType) {
		case "cp": {
			this.LabelAnalysisEval.Text.Set("Evaluation: "+this.format_eval(this.StartingPosScore));

			break;
		}

		case "mate": {
			this.LabelAnalysisEval.Text.Set("Evaluation: mate in "+this.StartingPosScore);

			break;
		}
	}
}

AnalysisTable.prototype.ClearAnalysisResult=function() {
	this.LabelAnalysisMove.Text.Set("");
	this.LabelAnalysisEval.Text.Set("");
}

/*
functions for converting engine-generated strings to better formatting
*/

AnalysisTable.prototype.get_move_label=function(str) {
	var promote_to=QUEEN;
	var fs=Util.sq(str.substr(0, 2));
	var ts=Util.sq(str.substr(2, 2));
	var promotion=str.substr(4, 1);

	if(promotion) {
		promote_to=Util.type(Fen.get_piece_int(promotion));
	}

	var move=this.Game.Move(fs, ts, promote_to, true);

	return move.GetLabel();
}

AnalysisTable.prototype.format_eval=function(str) {
	var score=parseFloat(str)/100;

	return (score>0?"+"+score:score).toString();
}

AnalysisTable.prototype.Die=function() {
	this.ClearEventHandlers();
	this.Dead.Fire();
}
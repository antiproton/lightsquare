function LiveTable(parent) {
	Control.implement(this, parent, true);
	IEventHandlerLogging.implement(this);

	this.owner=null;
	this.owner_rating=null;
	this.choose_colour=false;
	this.challenge_colour=WHITE;
	this.challenge_type=CHALLENGE_TYPE_CUSTOM;
	this.owner_rematch_ready=false;
	this.guest_rematch_ready=false;
	this.type=GAME_TYPE_STANDARD;
	this.variant=VARIANT_STANDARD;
	this.subvariant=null;
	this.score_owner=0;
	this.score_guest=0;
	this.event_type=EVENT_TYPE_CASUAL;
	this.event=null;
	this.fen=null;
	this.timing_initial=600;
	this.timing_increment=0;
	this.timing_style=TIMING_SUDDEN_DEATH;
	this.timing_overtime=false;
	this.timing_overtime_cutoff=40;
	this.timing_overtime_increment=600;
	this.alternate_colours=true;
	this.chess960_randomise_mode=CHESS960_RANDOMISE_EVERY_OTHER;
	this.permissions_watch=PERM_LEVEL_ANYONE;
	this.permissions_play=PERM_LEVEL_ANYONE;
	this.rated=true;
	this.game_in_progress=false;
	this.mtime_last_update=0;
	this.first_update=true;

	this.update_row=[
		"owner",
		"owner_rating",
		"choose_colour",
		"challenge_type",
		"challenge_colour",
		"owner_rematch_ready",
		"guest_rematch_ready",
		"type",
		"variant",
		"subvariant",
		"score_owner",
		"score_guest",
		"event_type",
		"event",
		"fen",
		"timing_initial",
		"timing_increment",
		"timing_style",
		"timing_overtime",
		"timing_overtime_cutoff",
		"timing_overtime_increment",
		"alternate_colours",
		"chess960_randomise_mode",
		"permissions_watch",
		"permissions_play",
		"rated",
		"game_in_progress"
	];

	this.Id=null;
	this.IsNew=true;

	this.html_is_setup=false;
	this.games_loaded=false;
	this.draw_offered_flag={}; //for not sending "opp has offered draw" msg multiple times.  indexed by Gid.
	this.undo_requested_flag={}; //see draw_offered_flag
	this.opp_disconnected_flag={}; //indexed by username
	this.row=null;
	this.Seats=[];
	this.Games={};
	this.GamesById=[];
	this.PlayerSeat=null;
	this.PlayerPresent=true; //NOTE this is a ridiculous workaround made necessary by the fact that the browser won't allow any part of any window's location to be changed from within a handler for "beforeunload"
	this.CurrentPlayerGame=null;

	/*
	FromQuickChallenge - a reference to the quick challenge that the user found
	the table with.  Will be null if the user has refreshed.
	*/

	this.FromQuickChallenge=null;

	/*
	NewQuickChallenge - the quick challenge created if the user clicks "new 10/5"
	*/

	this.NewQuickChallenge=null;

	this.plr_rematch_ready=false;
	this.opp_rematch_ready=false;

	this.force_resign_timer=null;

	this.init_view_props();
	this.init_props();
	this.init_events();
}

LiveTable.prototype.init_events=function() {
	this.SeatingChanged=new Event(this);
	this.Update=new Event(this);
	this.UiLoaded=new Event(this);
	this.Dead=new Event(this);
	this.Loaded=new Event(this);
	this.LoadFailed=new Event(this);
	this.UserNewQuickChallenge=new Event(this);
	this.UserClose=new Event(this);
}

LiveTable.prototype.init_data=function() {
	switch(this.type) {
		case GAME_TYPE_BUGHOUSE: {
			this.no_of_games=2;

			this.GameIdByRel={
				Player: 0,
				Other: 1
			};

			break;
		}

		default: {
			this.no_of_games=1;

			this.GameIdByRel={
				Player: 0
			};

			break;
		}
	}
}

LiveTable.prototype.start_updates=function() {
	Base.LongPoll.GatheringClientState.AddHandler(this, function(update) {
		update.AddClientData(this, UPDATE_TYPE_TABLE, {
			"id": this.Id,
			"mtime_last_update": this.mtime_last_update
		});
	});

	Base.LongPoll.HaveUpdates.AddHandler(this, function(update) {
		var data=update.GetUpdates(this);

		if(data!==null) {
			this.set_row(data);
			this.update(data);
			this.mtime_last_update=data["mtime_last_update"];
		}
	});
}

LiveTable.prototype.init_view_props=function() {
	this.View={
		GameId: new Property(this, function() {
			return this.player_game_id;
		}, function(value) {
			this.GameIdByRel.Player=value;

			if(this.type===GAME_TYPE_BUGHOUSE) { //NOTE some things depend on GameIdByRel only having Player if type std
				this.GameIdByRel.Other=Util.opp_game(value);
			}

			this.player_game_id=value;
			this.UpdateView();
		}),

		Colour: new Property(this, function(game_id) {
			if(!is_number(game_id)) {
				game_id=this.player_game_id;
			}

			return this.player_colour[game_id];
		}, function(value, game_id) {
			if(!is_number(game_id)) {
				game_id=this.player_game_id;
			}

			this.ColourByRel[game_id].Player=value;
			this.ColourByRel[game_id].Opponent=Util.opp_colour(value);
			this.player_colour[game_id]=value;
			this.UpdateView();
		})
	};
}

/*
FIXME are props ever used?
*/

LiveTable.prototype.init_props=function() {
	this.Owner=new Property(this, function() {
		return this.owner;
	}, function(value) {
		this.owner=value;
		this.update_table_panel();
	});

	this.ChooseColour=new Property(this, function() {
		return this.choose_colour;
	}, function(value) {
		this.choose_colour=value;
	});

	this.ChallengeType=new Property(this, function() {
		return this.challenge_type;
	}, function(value) {
		this.challenge_type=value;
	});

	this.Type=new Property(this, function() {
		return this.type;
	}, function(value) {
		if(!this.html_is_setup) {
			this.type=value;
		}
	});

	this.Variant=new Property(this, function() {
		return this.variant;
	}, function(value) {
		this.variant=value;
		this.TablePanel.DropDownVariant.Value.Set(value);
	});

	this.Subvariant=new Property(this, function() {
		return this.subvariant;
	}, function(value) {
		this.subvariant=value;
		this.TablePanel.DropDownSubvariant.Value.Set(value);
	});

	/*
	NOTE scores are for quick challenges only
	*/

	this.ScoreOwner=new Property(this, function() {
		return this.score_owner;
	}, function(value) {
		this.score_owner=value;
		this.update_scores();
	});

	this.ScoreGuest=new Property(this, function() {
		return this.score_guest;
	}, function(value) {
		this.score_guest=value;
		this.update_scores();
	});

	this.EventType=new Property(this, function() {
		return this.event_type;
	});

	this.Event=new Property(this, function() {
		return this.event;
	}, function(value) {
		this.event=value;
		this.UpdateHtml();
	});

	this.Fen=new Property(this, function() {
		return this.fen;
	}, function(value) {
		this.fen=value;
		this.UpdateHtml();
	});

	this.TimingInitial=new Property(this, function() {
		return this.timing_initial;
	}, function(value) {
		this.timing_initial=value;
		this.TablePanel.TimeSetting.Initial.Set(value);
	});

	this.TimingIncrement=new Property(this, function() {
		return this.timing_increment;
	}, function(value) {
		this.timing_increment=value;
		this.TablePanel.TimeSetting.Increment.Set(value);
	});

	this.TimingStyle=new Property(this, function() {
		return this.timing_style;
	}, function(value) {
		this.timing_style=value;
		this.TablePanel.TimeSetting.Style.Set(value);
	});

	this.TimingOvertime=new Property(this, function() {
		return this.timing_overtime;
	}, function(value) {
		this.timing_overtime=value;
		this.TablePanel.TimeSetting.Overtime.Set(value);
	});

	this.TimingOvertimeCutoff=new Property(this, function() {
		return this.timing_overtime_cutoff;
	}, function(value) {
		this.timing_overtime_cutoff=value;
		this.TablePanel.TimeSetting.OvertimeCutoff.Set(value);
	});

	this.TimingOvertimeIncrement=new Property(this, function() {
		return this.timing_overtime_increment;
	}, function(value) {
		this.timing_overtime_increment=value;
		this.TablePanel.TimeSetting.OvertimeIncrement.Set(value);
	});

	this.AlternateColours=new Property(this, function() {
		return this.alternate_colours;
	}, function(value) {
		this.alternate_colours=value;
		this.TablePanel.CheckboxAlternateColours.Checked.Set(value);
	});

	this.Chess960RandomiseMode=new Property(this, function() {
		return this.chess960_rerandomise_mode;
	}, function(value) {
		this.chess960_rerandomise_mode=value;
		this.TablePanel.DropDownChess960RandomiseMode.Value.Set(value);
	});

	this.PermissionsWatch=new Property(this, function() {
		return this.permissions_watch;
	}, function(value) {
		this.permissions_watch=value;
		this.TablePanel.DropDownPermsWatch.Value.Set(value);
	});

	this.PermissionsPlay=new Property(this, function() {
		return this.permissions_play;
	}, function(value) {
		this.permissions_play=value;
		this.TablePanel.DropDownPermsPlay.Value.Set(value);
	});

	this.Rated=new Property(this, function() {
		return this.rated;
	}, function(value) {
		this.rated=value;
		this.TablePanel.CheckboxRated.Checked.Set(value);
	});

	this.GameInProgress=new Property(this, function() {
		return this.game_in_progress;
	}, function(value) {
		this.game_in_progress=value; //TODO update Ready here?
	});

	this.MtimeLastUpdate=new Property(this, function() {
		return this.mtime_last_update;
	});

	this.HtmlIsSetup=new Property(this, function() {
		return this.html_is_setup;
	});

	this.PlayerIsSeated=new Property(this, function() {
		return (this.PlayerSeat!==null);
	});
}

LiveTable.prototype.init_view=function() {
	this.ColourByRel=[];

	var view_as={
		Player: WHITE,
		Other: BLACK
	};

	for(var rel in this.GameIdByRel) {
		this.ColourByRel[this.GameIdByRel[rel]]={
			Player: view_as[rel],
			Opponent: Util.opp_colour(view_as[rel])
		};
	}

	this.player_game_id=0;
	this.player_colour=[];

	for(var rel in this.GameIdByRel) {
		this.player_colour[this.GameIdByRel[rel]]=view_as[rel];
	}
}

LiveTable.prototype.init_seats=function() {
	var colours=[WHITE, BLACK];
	var colour;
	var seat;

	Base.LongPoll.Pause(function() {
		for(var game_id=0; game_id<this.no_of_games; game_id++) {
			for(var c=0; c<colours.length; c++) {
				colour=colours[c];

				if(!(game_id in this.Seats)) {
					this.Seats[game_id]=[];
				}

				seat=new Seat(this, game_id, colour);

				seat.Update.AddHandler(this, function(data, sender) {
					var username=sender.Username.Get();
					var from_plr_seat=(sender===this.PlayerSeat); //this might become "was the player seat"

					if(from_plr_seat) {
						if(username!==Base.App.User.Username) {
							this.PlayerSeat=null;
						}
					}

					else {
						if(username===Base.App.User.Username) {
							this.take_seat(sender);
						}
					}

					if(this.html_is_setup) {
						if(sender===this.PlayerSeat || from_plr_seat) {
							this.update_ready_button();
							this.update_current_player_game();
							this.update_game_user_control();
							this.UpdateView();
						}

						this.UiByCode.ByGameAndColour[sender.GameId][sender.Colour].PlayerInfo.Username.Set(username);

						if(data.OldUsername!==username) {
							this.UiByCode.ByGameAndColour[sender.GameId][sender.Colour].PlayerInfo.LoadRating(
								this.type,
								this.variant,
								Timing.GetFormat(
									this.timing_style,
									this.timing_initial,
									this.timing_increment,
									this.timing_overtime,
									this.timing_overtime_increment,
									this.timing_overtime_cutoff
								)
							);
						}

						this.update_game_panel();
						this.update_team_chat();
					}

					if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
						this.update_rematch_buttons();
					}

					this.SeatingChanged.Fire();
				});

				this.Seats[game_id][colour]=seat;
			}
		}
	}, this);
}

/*
set_row and update are split up because some of it needs to be called
before SetupHtml and some after

(SetupHtml needs to know type; some update stuff needs GameIdByRel etc
which is all set up in SetupHtml (and depends on type))
*/

LiveTable.prototype.set_row=function(row) {
	this.row=row;
	var field;

	for(var i=0; i<this.update_row.length; i++) {
		field=this.update_row[i];

		this[field]=row[field];
	}
}

LiveTable.prototype.update=function(row) {
	if(this.challenge_type===CHALLENGE_TYPE_CUSTOM) {
		var time_fields=[
			"timing_initial",
			"timing_increment",
			"timing_style",
			"timing_overtime",
			"timing_overtime_cutoff",
			"timing_overtime_increment"
		];

		var time_changed=false; //if the clock settings have been changed, update the player clocks
		var field;

		for(var i=0; i<time_fields.length; i++) {
			field=time_fields[i];

			if(row[field]!==this[field]) {
				time_changed=true;

				break;
			}
		}

		if(time_changed) {
			this.update_player_clocks();
		}
	}

	if(this.game_in_progress && !this.games_loaded) {
		for(var gid in this.Games) {
			this.Games[gid].ClearEventHandlers();
		}

		for(var rel in this.UiByRel.ByGame) {
			this.UiByRel.ByGame[rel].History.ClearEventHandlers();
		}

		this.load_games();
		this.games_loaded=true;
	}

	if(!this.game_in_progress) {
		this.games_loaded=false;
	}

	this.update_clock_display();
	this.update_table_panel();
	this.update_game_panel();
	this.update_ratings();

	if(this.challenge_type===CHALLENGE_TYPE_CUSTOM) {
		this.update_ready_button();
	}

	else if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
		var is_owner=(this.owner===Base.App.User.Username);

		var rematch_ready={
			Player: is_owner?this.owner_rematch_ready:this.guest_rematch_ready,
			Opponent: is_owner?this.guest_rematch_ready:this.owner_rematch_ready
		};

		if(rematch_ready.Opponent && !this.opp_rematch_ready && !this.game_in_progress && !this.first_update) { //opponent offered
			var opp_seat=this.Seats[this.PlayerSeat.GameId][Util.opp_colour(this.PlayerSeat.Colour)];

			this.opp_rematch_ready=true;
			this.TableChat.AddMessage("<b>"+opp_seat.Username.Get()+" has offered you a rematch.</b>");
		}

		this.opp_rematch_ready=rematch_ready.Opponent;
		this.plr_rematch_ready=rematch_ready.Player;

		this.update_rematch_buttons();
		this.update_scores();
	}

	this.Update.Fire();
	this.first_update=false;
}

LiveTable.prototype.Load=function(id) {
	/*
	Id set first so that init code can tell straight away which
	tables are already open
	*/

	this.Id=id;

	Xhr.QueryAsync(ap("/xhr/load_table.php"), function(response) {
		if(response!==false) {
			this.set_row(response);
			this.IsNew=false;
			this.init_data();
			this.init_seats();
			this.init_view();
			this.SetupHtml();
			this.update(response);
			this.start_updates();
			this.load_games();
			this.setup_comments();
			this.setup_team_chat();
			this.Loaded.Fire();
		}

		else {
			this.display_load_fail_message();
			this.LoadFailed.Fire();
		}
	}, {
		"id": id
	}, this);
}

/*
field names passed to this will be sent in the update regardless of
whether they appear to have changed since the last update.

e.g. Save("timing_initial", "timing_increment") will definitely update
those fields.

NOTE this function won't be used for QUICK challenges - table is created
serverside and isn't editable.
*/

LiveTable.prototype.Save=function() {
	var self=this;

	if(this.IsNew) {
		var row={
			"type": this.type,
			"variant": this.variant,
			"subvariant": this.subvariant,
			"fen": this.fen,
			"timing_initial": this.timing_initial,
			"timing_increment": this.timing_increment,
			"timing_delay": this.timing_delay,
			"timing_style": this.timing_style,
			"alternate_colours": this.alternate_colours,
			"chess960_rerandomise_mode": this.chess960_rerandomise_mode,
			"permissions_watch": this.permissions_watch,
			"permissions_play": this.permissions_play,
			"rated": this.rated
		};

		Xhr.QueryAsync(ap("/xhr/create_table.php"), function(response) {
			if(response!==false) {
				this.row=row;
				this.Id=response;
				this.IsNew=false;
				this.init_data();
				this.init_seats();
				this.init_view();
				this.SetupHtml();
				this.setup_comments();
				this.setup_team_chat();
				this.start_updates();
				this.Loaded.Fire();
			}
		}, row, this);
	}

	else {
		var update={};
		var field;

		for(var i=0; i<this.update_row.length; i++) {
			field=this.update_row[i];

			if(this[field]!==this.row[field] || in_array(field, arguments)) {
				update[field]=this[field];
			}
		}

		if(!is_empty_object(update)) {
			update["id"]=this.Id;
			Xhr.RunQueryAsync(ap("/xhr/update_table.php"), update);
		}
	}
}

LiveTable.prototype.SetupHtml=function() {
	var self=this;
	var container;
	var is_quick=(this.challenge_type===CHALLENGE_TYPE_QUICK);

	this.history_col_width=180;
	this.history_col_padding_l=8;
	this.history_col_padding_r=7;
	this.history_width=this.history_col_width-(this.history_col_padding_l+this.history_col_padding_r);

	this.top_container=div(this.Node);

	/*
	NOTE source order switched so links go above panel if not
	enough width for side by side
	*/

	this.links_container=div(this.top_container);
	this.title_container=div(this.top_container);

	Dom.Style(this.title_container, {
		cssFloat: "left",
		paddingLeft: 1
	});

	Dom.Style(this.links_container, {
		cssFloat: "right"
	});

	this.links_inner=idiv(this.links_container);

	Dom.Style(this.links_inner, {
		cursor: "default"
	});

	Dom.AddClass(this.links_inner, "table_util_links");

	//this.LinkGetPgn=new Link(this.links_inner, "PGN");
	//this.links_inner.appendChild($("%\u00a0\u00a0"));
	//this.LinkAnalyse=new Link(this.links_inner, "Analyse");
	//this.links_inner.appendChild($("%\u00a0"));

	cb(this.top_container);

	this.TablePanel=new LiveTablePanel(this.title_container);

	Dom.Style(this.top_container, {
		margin: "0 0px",
		borderBottom: "1px solid #cdcdcd",
		padding: "7px 5px 4px 5px",
		//boxShadow: "inset 0px -2px 2px rgba(50, 50, 50, .15)"
		//backgroundImage: Dom.CssUrl(ap("/img/table_panel_bg.png")),
		backgroundPosition: "left bottom",
		backgroundRepeat: "repeat-x"
	});

	this.game_main_container=div(this.Node);
	this.game_inner=div(this.game_main_container);

	Dom.Style(this.game_main_container, {
		paddingTop: 6,
		paddingBottom: 6
	});

	//the main layout is set up like a table
	//with 3 main cols

	this.cols={
		game: div(this.game_inner),
		history: div(this.game_inner),
		bughouse_other: div(this.game_inner)
	};

	this.cols_inner={
		game: div(this.cols.game),
		history: div(this.cols.history),
		bughouse_other: div(this.cols.bughouse_other)
	};

	Dom.Style(this.cols.history, {
		width: this.history_col_width
	});

	var col;

	for(var p in this.cols) {
		col=this.cols[p];

		Dom.Style(col, {
			cssFloat: "left"
		});
	}

	cb(this.game_inner);

	//game cols - 3 rows each (opp info, board, plr info)

	this.game_cols={
		Player: this.cols_inner.game,
		Other: this.cols_inner.bughouse_other
	};

	this.game_rows={};

	for(var p in this.game_cols) {
		this.game_rows[p]={
			opp_info: div(this.game_cols[p]),
			board: div(this.game_cols[p]),
			plr_info: div(this.game_cols[p]),
			chat: div(this.game_cols[p])
		};
	}

	this.bgh_pcs_divs={};

	this.bgh_pcs_divs.Opponent=div(this.cols_inner.history);
	this.history_container=div(this.cols_inner.history);
	this.result_display_container=div(this.cols_inner.history);
	this.history_controls_container=div(this.cols_inner.history);
	this.game_panel_container=div(this.cols_inner.history);
	this.dead_pieces_container=div(this.cols_inner.history);
	this.bgh_pcs_divs.Player=div(this.cols_inner.history);

	this.game_cells={
		Player: this.game_rows.Player.board,
		Other: this.game_rows.Other.board
	};

	this.plrinfo_cells={
		Player: {
			Player: this.game_rows.Player.plr_info,
			Opponent: this.game_rows.Player.opp_info
		},

		Other: {
			Player: this.game_rows.Other.plr_info,
			Opponent: this.game_rows.Other.opp_info
		}
	};

	this.history_containers={};
	this.board_containers={};
	this.plrdetails_containers={};
	this.plrtime_containers={};
	this.plrinfo_containers={};
	this.bughouse_pieces_available_containers={};

	/*
	near one floats left, far one floats right so that they are
	pushed up near their relevant games
	*/

	var bgh_float={
		Player: "left",
		Other: "right"
	};

	var game_container;
	var game_id;

	this.UiByRel={
		ByGame: {},
		ByGameAndPlayer: {}
	};

	this.UiByCode={
		ByGame: [],
		ByGameAndColour: []
	};

	var history, board, chat, clock, player_info, player_clock;

	for(var rel in this.GameIdByRel) {
		game_id=this.GameIdByRel[rel];
		game_container=this.game_cells[rel];

		this.UiByRel.ByGame[rel]={};
		this.UiByRel.ByGameAndPlayer[rel]={};
		this.UiByCode.ByGame[game_id]={};
		this.UiByCode.ByGameAndColour[game_id]=[];

		this.board_containers[rel]=$("*div");
		this.history_containers[rel]=$("*div");
		this.plrdetails_containers[rel]={};
		this.plrtime_containers[rel]={};
		this.plrinfo_containers[rel]={};

		if(this.type===GAME_TYPE_BUGHOUSE) {
			this.bughouse_pieces_available_containers[rel]={};
		}

		for(var plr in this.ColourByRel[game_id]) {
			this.plrinfo_containers[rel][plr]=$("*div");
		}

		this.plrinfo_cells[rel].Opponent.appendChild(this.plrinfo_containers[rel].Opponent);
		game_container.appendChild(this.board_containers[rel]);
		this.plrinfo_cells[rel].Player.appendChild(this.plrinfo_containers[rel].Player);

		var plrinfo_container;
		var colour;

		for(var plr in this.ColourByRel[game_id]) {
			colour=this.ColourByRel[game_id][plr];

			this.UiByRel.ByGameAndPlayer[rel][plr]={};
			this.UiByCode.ByGameAndColour[game_id][colour]={};

			plrinfo_container=this.plrinfo_containers[rel][plr];

			this.plrdetails_containers[rel][plr]=div(plrinfo_container);
			this.plrtime_containers[rel][plr]=div(plrinfo_container);
			cb(plrinfo_container);

			player_info=new PlayerInfo(this.plrdetails_containers[rel][plr], game_id, !is_quick);
			this.UiByRel.ByGameAndPlayer[rel][plr].PlayerInfo=player_info;
			this.UiByCode.ByGameAndColour[game_id][colour].PlayerInfo=player_info;
			player_info.Colour.Set(this.ColourByRel[game_id][plr]);
			player_info.ShowScore.Set(is_quick);

			player_info.Sit.AddHandler(this, function(data, sender) {
				self.Sit(sender.GameId.Get(), sender.Colour.Get());
			});

			player_clock=new PlayerClock(this.plrtime_containers[rel][plr]);
			this.UiByRel.ByGameAndPlayer[rel][plr].PlayerClock=player_clock;
			this.UiByCode.ByGameAndColour[game_id][colour].PlayerClock=player_clock;
			player_clock.UrgentThreshold.Set(0);

			if(this.type===GAME_TYPE_BUGHOUSE) {
				this.bughouse_pieces_available_containers[rel][plr]=div(this.bgh_pcs_divs[plr]);

				Dom.Style(this.bughouse_pieces_available_containers[rel][plr], {
					cssFloat: bgh_float[rel]
				});

				bughouse_pieces_available=new BughousePiecesAvailable(this.bughouse_pieces_available_containers[rel][plr]);

				this.UiByRel.ByGameAndPlayer[rel][plr].BughousePiecesAvailable=bughouse_pieces_available;
				this.UiByCode.ByGameAndColour[game_id][colour].BughousePiecesAvailable=bughouse_pieces_available;
			}
		}

		clock=new Clock();

		clock.GameId=game_id;

		this.UiByCode.ByGame[game_id].Clock=clock;

		clock.Update.AddHandler(this, function(data, sender) {
			this.UiByCode.ByGameAndColour[sender.GameId][WHITE].PlayerClock.Mtime.Set(sender.Mtime[WHITE]);
			this.UiByCode.ByGameAndColour[sender.GameId][BLACK].PlayerClock.Mtime.Set(sender.Mtime[BLACK]);
		});

		board=new UiBoard(this.board_containers[rel]);

		board.UiUpdate.AddHandler(this, function() {
			this.UpdateHtml();
		});

		this.UiByRel.ByGame[rel].Board=board;
		this.UiByCode.ByGame[game_id].Board=board;

		chat=new ChatBox(this.game_rows[rel].chat);

		this.UiByRel.ByGame[rel].Chat=chat;
		this.UiByCode.ByGame[game_id].Chat=chat;

		this.history_container.appendChild(this.history_containers[rel]);

		history=new UiHistoryColView(this.history_containers[rel]);
		history.Width.Set(this.history_width);

		this.UiByRel.ByGame[rel].History=history;
		this.UiByCode.ByGame[game_id].History=history;

		for(var plr in this.plrtime_containers[rel]) {
			Dom.Style(this.plrtime_containers[rel][plr], {
				cssFloat: "right"
			});
		}

		for(var plr in this.plrdetails_containers[rel]) {
			Dom.Style(this.plrdetails_containers[rel][plr], {
				cssFloat: "left"
			});
		}
	}

	for(var plr in this.bgh_pcs_divs) {


		cb(this.bgh_pcs_divs[plr]);
		this.bgh_pcs_divs[plr].name="BGH_PCS_DIV";
	}

	//right col - pieces taken, game panel etc (the container is called "history" for some reason)

	Dom.Style(this.game_panel_container, {
		paddingTop: 5
	});

	Dom.Style(this.dead_pieces_container, {
		paddingTop: 5
	});

	this.HistoryControls=new HistoryControls(this.history_controls_container);
	this.HistoryControls.Width.Set(this.history_width);

	this.ResultDisplay=new ResultDisplay(this.result_display_container);
	this.ResultDisplay.Hide();

	this.GamePanel=new GamePanel(this.game_panel_container);

	if(this.PlayerSeat!==null) {
		this.update_ready_button();
	}

	this.PiecesTaken=[null, null];

	if(this.type===GAME_TYPE_STANDARD) {
		var pt=new UiPiecesTaken(this.dead_pieces_container);
		this.PiecesTaken=[pt, pt];
	}

	/*
	chat boxes - for bughouse, the one under the player game is private chat
	and the one under the other game is table chat - for standard, the table
	chat is under the player game and there is no private chat.
	*/

	this.TableChat=this.UiByRel.ByGame.Player.Chat;
	this.TableChat.AddMessage("Table chat #"+this.Id);

	this.BughousePartnerChat=null;

	if(this.type===GAME_TYPE_BUGHOUSE) {
		this.BughousePartnerChat=this.UiByRel.ByGame.Other.Chat;
		this.BughousePartnerChat.AddMessage("Team chat");

		this.GamePanel.ButtonClaimFiftymove.Display.Set(false);
		this.GamePanel.ButtonClaimThreefold.Display.Set(false);
		this.GamePanel.ButtonDraw.Display.Set(false);
		this.GamePanel.ButtonUndo.Display.Set(false);

		this.UiByRel.ByGame.Other.History.Hide(); //NOTE just so that there is only 1 if no game.  when games start, it may be the Other one that gets shown

		Dom.Style(this.bughouse_pieces_available_containers.Player.Opponent, {
			marginBottom: 5
		});

		for(var plr in this.UiByRel.ByGameAndPlayer.Other) {
			this.UiByRel.ByGameAndPlayer.Other[plr].BughousePiecesAvailable.SquareSize.Set(30);
		}

		this.UiByRel.ByGameAndPlayer.Player.Opponent.BughousePiecesAvailable.SquareSize.Set(30);
	}

	if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
		this.GamePanel.CustomTableContainer.Display.Set(false);
	}

	this.UiByRel.ByGame.Player.Board.ForceResignDialog.ButtonForce.Click.AddHandler(this, function() {
		this.force_resign();
	});

	this.setup_table_panel();
	this.setup_game_panel();

	this.html_is_setup=true;
	this.UpdateHtml();
	this.UpdateView();
	this.update_table_panel();

	this.UiLoaded.Fire();
}

LiveTable.prototype.UpdateHtml=function() {
	if(this.html_is_setup) {
		var board=this.UiByRel.ByGame.Player.Board;
		var coords=board.ShowCoords.Get();
		var coord_size_r=board.CoordSizeR.Get();
		var coord_size_f=board.CoordSizeF.Get();
		var oppinfo_height=this.UiByRel.ByGameAndPlayer.Player.Opponent.PlayerInfo.Height.Get();

		Dom.Style(this.cols_inner.history, {
			paddingTop: oppinfo_height,
			paddingLeft: this.history_col_padding_l,
			paddingRight: this.history_col_padding_r
		});

		for(var rel in this.GameIdByRel) {
			Dom.Style(this.plrinfo_containers[rel].Player, {
				paddingTop: 3
			});

			board=this.UiByRel.ByGame[rel].Board;
			var board_width=board.OverallWidth.Get();

			for(var plr in this.UiByRel.ByGameAndPlayer[rel]) {
				Dom.Style(this.plrinfo_containers[rel][plr], {
					width: board_width
				});
			}

			this.UiByRel.ByGame[rel].Chat.Width.Set(board_width);
		}

		this.update_table_panel();

		//stop divs dropping down when the window is too small
		//by setting an explicit width on the container which is
		//enough to hold them all

		var board_widths={
			Player: 0,
			Other: 0
		};

		for(var rel in this.GameIdByRel) {
			board_widths[rel]=this.UiByRel.ByGame[rel].Board.OverallWidth.Get();

			Dom.Style(this.game_cols[rel], {
				width: board_widths[rel]
			});
		}

		var total_width=this.history_col_width+board_widths.Player+board_widths.Other;

		Dom.Style(this.game_inner, {
			width: total_width,
			margin: "0 auto"
		});

		this.UiUpdate.Fire();
	}
}

LiveTable.prototype.UpdateView=function() {
	if(this.html_is_setup) {
		//update references in UiByCode to point to the right objects in UiByRel

		/*
		NOTE Clocks aren't really UI elements so they don't have an entry in UiByRel.
		They are in UiByCode because they need to be indexed by game id.  in their
		Update handler the right player clocks are selected by using UiByCode with their
		game ids, so the reference updating is necessary for PlayerClocks
		*/

		var game_id, colour;

		for(var rel in this.GameIdByRel) {
			game_id=this.GameIdByRel[rel];

			this.UiByCode.ByGame[game_id].Board=this.UiByRel.ByGame[rel].Board;
			this.UiByCode.ByGame[game_id].History=this.UiByRel.ByGame[rel].History;

			for(var colour_rel in this.ColourByRel[game_id]) {
				colour=this.ColourByRel[game_id][colour_rel];

				this.UiByCode.ByGameAndColour[game_id][colour].BughousePiecesAvailable=this.UiByRel.ByGameAndPlayer[rel][colour_rel].BughousePiecesAvailable;
				this.UiByCode.ByGameAndColour[game_id][colour].PlayerInfo=this.UiByRel.ByGameAndPlayer[rel][colour_rel].PlayerInfo;
				this.UiByCode.ByGameAndColour[game_id][colour].PlayerClock=this.UiByRel.ByGameAndPlayer[rel][colour_rel].PlayerClock;
			}
		}

		//update PlayerInfos

		var colours=[WHITE, BLACK];
		var colour;
		var username;
		var details;
		var player_info, tmp_plr_info;

		for(var game_id=0; game_id<this.Seats.length; game_id++) {
			for(var c=0; c<colours.length; c++) {
				colour=colours[c];
				username=this.Seats[game_id][colour].Username.Get();
				details=null;

				player_info=this.UiByCode.ByGameAndColour[game_id][colour].PlayerInfo;
				player_info.Username.Set(username);
				player_info.Colour.Set(colour);
				player_info.GameId.Set(game_id);

				if(username!==null) { //see if we have already loaded details for this user
					for(var game_rel in this.UiByRel.ByGameAndPlayer) {
						for(var plr_rel in this.UiByRel.ByGameAndPlayer[game_rel]) {
							tmp_plr_info=this.UiByRel.ByGameAndPlayer[game_rel][plr_rel].PlayerInfo;

							if(tmp_plr_info.Username.Get()===username && tmp_plr_info.Colour.Get()===colour) {
								details={
									Rating: tmp_plr_info.Rating.Get()
								};

								break;
							}
						}
					}
				}

				if(details===null) {
					player_info.LoadRating(
						this.type,
						this.variant,
						Timing.GetFormat(
							this.timing_style,
							this.timing_initial,
							this.timing_increment,
							this.timing_overtime,
							this.timing_overtime_increment,
							this.timing_overtime_cutoff
						)
					);
				}

				else {
					player_info.Rating.Set(details.Rating);
				}
			}
		}

		if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
			this.update_scores();
		}

		//set board views, and show the player's game history if bughouse
		//also controls which history the history controls are connected to

		/*
		NOTE histories are assigned to games in the LiveGame constructor and
		aren't swapped around afterwards, so the Player history won't be the
		Player game - to see which is the real player history we have to do
		this:
		*/

		var history;
		var player_history=null;

		if(this.type===GAME_TYPE_BUGHOUSE && this.games_loaded) {
			for(var rel in this.UiByRel.ByGame) {
				history=this.UiByRel.ByGame[rel].History;

				if(this.CurrentPlayerGame!==null && history===this.CurrentPlayerGame.History) {
					history.Show();
					player_history=history;
				}

				else {
					history.Hide();
				}
			}
		}

		var game_id;

		for(var rel in this.GameIdByRel) {
			game_id=this.GameIdByRel[rel];

			this.UiByCode.ByGame[game_id].Board.ViewAs.Set(this.View.Colour.Get(game_id));
		}

		if(this.type===GAME_TYPE_BUGHOUSE && this.games_loaded) {
			var game;

			for(game_id=0; game_id<this.GamesById.length; game_id++) {
				game=this.GamesById[game_id];
				game.SetBoard(this.UiByCode.ByGame[game_id].Board);
			}

			this.update_pieces_taken();
		}

		if(player_history!==null) {
			this.HistoryControls.History=player_history;
		}

		else {
			this.HistoryControls.History=this.UiByRel.ByGame.Player.History;
		}

		for(var i=0; i<colours.length; i++) {
			colour=colours[i];

			if(this.PiecesTaken[colour]!==null) {
				this.PiecesTaken[colour].ViewAs.Set(this.player_colour[this.player_game_id]);
			}
		}
	}
}

LiveTable.prototype.display_load_fail_message=function() {
	var tmp=div(this.Node);

	Dom.Style(tmp, {
		fontSize: "1.1em",
		textAlign: "center",
		color: "#5f5f5f",
		padding: "1em"
	});

	tmp.innerHTML="This table no longer exists in the database.  ";

	var close_link=$("*a");

	tmp.appendChild(close_link);

	close_link.innerHTML="Close tab";

	close_link.href="javascript:void(0)";

	Dom.Style(close_link, {
		color: "#4F87AF"
	});

	Dom.AddEventHandler(close_link, "click", function() {
		this.UserClose.Fire();
	}, this);
}

/*
updates a reference to the current player game - the game the user is
playing, or viewing.
*/

LiveTable.prototype.update_current_player_game=function() {
	if(this.GameIdByRel.Player in this.GamesById) {
		this.CurrentPlayerGame=this.GamesById[this.GameIdByRel.Player];
	}

	else {
		this.CurrentPlayerGame=null;
	}
}

LiveTable.prototype.Sit=function(game_id, colour) {
	this.Seats[game_id][colour].Sit(Base.App.User.Username);
}

LiveTable.prototype.take_seat=function(seat) {
	this.PlayerSeat=seat;
	this.View.GameId.Set(seat.GameId);
	this.View.Colour.Set(seat.Colour, seat.GameId);

	if(this.type===GAME_TYPE_BUGHOUSE) {
		this.View.Colour.Set(this.ColourByRel[this.player_game_id].Opponent, this.GameIdByRel.Other);
	}
}

LiveTable.prototype.Stand=function() {
	if(this.PlayerSeat!==null) {
		this.PlayerSeat.Stand();
	}
}

LiveTable.prototype.Ready=function(ready) {
	if(this.PlayerSeat!==null) {
		this.PlayerSeat.SetReady(ready);
	}
}

LiveTable.prototype.update_table_panel=function() {
	if(this.html_is_setup) {
		var is_owner=(this.owner===Base.App.User.Username);
		var no_games_in_progress=true;
		var game;

		for(var gid in this.Games) {
			game=this.Games[gid];

			if(game.State===GAME_STATE_IN_PROGRESS) {
				no_games_in_progress=false;

				break;
			}
		}

		var enabled=(is_owner && no_games_in_progress);
		var custom=(this.challenge_type===CHALLENGE_TYPE_CUSTOM);

		var table_panel_controls=[
			this.TablePanel.DropDownVariant,
			this.TablePanel.DropDownChess960RandomiseMode,
			this.TablePanel.DropDownSubvariant,
			this.TablePanel.CheckboxAlternateColours,
			this.TablePanel.CheckboxRated,
			this.TablePanel.TimeSetting
		];

		if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
			for(var p in table_panel_controls) {
				table_panel_controls[p].Configurable.Set(false);
			}
		}

		else {
			for(var p in table_panel_controls) {
				table_panel_controls[p].Enabled.Set(enabled);
			}
		}

		if(this.variant===VARIANT_960 && custom) {
			this.TablePanel.DropDownChess960RandomiseMode.Show();
		}

		else {
			this.TablePanel.DropDownChess960RandomiseMode.Hide();
		}

		/*
		if the current variant has subvariants, update the subvariant
		dropdown and show it.  since it was simpler to make all games/tables
		have a code for their subvariant, SUBVARIANT_NONE was introduced
		without a parent variant.  Its description is Standard to make the
		table panel read better.
		*/

		var has_subvariants=false;

		this.TablePanel.DropDownSubvariant.Hide();
		this.TablePanel.DropDownSubvariant.Clear();

		for(var code in DbEnums[SUBVARIANT]) {
			if(DbEnums[SUBVARIANT][code].Parent===this.variant) {
				this.TablePanel.DropDownSubvariant.Add(code, DbEnums[SUBVARIANT][code].Description);
				has_subvariants=true;
			}

			else if(DbEnums[SUBVARIANT][code].Parent===null) {
				this.TablePanel.DropDownSubvariant.Add(code, DbEnums[SUBVARIANT][code].Description);
			}
		}

		if(has_subvariants && custom) {
			this.TablePanel.DropDownSubvariant.Show();
		}

		this.TablePanel.DropDownVariant.Value.Set(this.variant);
		this.TablePanel.DropDownSubvariant.Value.Set(this.subvariant);
		this.TablePanel.CheckboxAlternateColours.Checked.Set(this.alternate_colours);
		this.TablePanel.DropDownChess960RandomiseMode.Value.Set(this.chess960_randomise_mode);
		this.TablePanel.CheckboxRated.Checked.Set(this.rated);
		this.TablePanel.TimeSetting.Initial.Set(this.timing_initial);
		this.TablePanel.TimeSetting.Increment.Set(this.timing_increment);
		this.TablePanel.TimeSetting.Style.Set(this.timing_style);
		this.TablePanel.TimeSetting.Overtime.Set(this.timing_overtime);
		this.TablePanel.TimeSetting.OvertimeIncrement.Set(this.timing_overtime_increment);
		this.TablePanel.TimeSetting.OvertimeCutoff.Set(this.timing_overtime_cutoff);
	}
}

LiveTable.prototype.update_game_panel=function() {
	if(this.html_is_setup) {
		var seated=this.PlayerIsSeated.Get();
		var active;

		if(seated && this.game_in_progress && (this.PlayerSeat.GameId in this.GamesById)) {
			var game=this.GamesById[this.PlayerSeat.GameId];
			var pos=game.StartingPosition;
			var moves_made=(game.History.MainLine.Line.Length>0);
			var opp_colour=Util.opp_colour(this.PlayerSeat.Colour);

			if(moves_made) {
				pos=new Position(game.History.MainLine.LastMove.Fen);
			}

			active=(this.PlayerSeat.Colour===pos.Active);

			this.GamePanel.ButtonResign.Enabled.Set(true);
			this.GamePanel.ButtonDraw.Enabled.Set((moves_made && !active && game.DrawOffered===null) || (active && game.DrawOffered===opp_colour));
			this.GamePanel.ButtonUndo.Enabled.Set(moves_made && !active);
			this.GamePanel.ButtonClaimFiftymove.Display.Set(game.FiftymoveClaimable && active);
			this.GamePanel.ButtonClaimThreefold.Display.Set(game.ThreefoldClaimable && active);
		}

		else {
			this.GamePanel.ButtonResign.Enabled.Set(false);
			this.GamePanel.ButtonDraw.Enabled.Set(false);
			this.GamePanel.ButtonUndo.Enabled.Set(false);
			this.GamePanel.ButtonClaimFiftymove.Display.Set(false);
			this.GamePanel.ButtonClaimThreefold.Display.Set(false);
		}

		this.GamePanel.ButtonStand.Display.Set(seated);
		this.GamePanel.ButtonReady.Display.Set(seated);
		this.GamePanel.ButtonStand.Enabled.Set(!this.game_in_progress);
		this.GamePanel.ButtonReady.Enabled.Set(!this.game_in_progress);
	}
}

LiveTable.prototype.update_scores=function() {
	var colours=[WHITE, BLACK];
	var colour, username, plrinfo;
	var game_id=0; //only for quick challenges, so there is only one game

	for(var c=0; c<colours.length; c++) {
		colour=colours[c];
		username=this.Seats[game_id][colour].Username.Get();
		plrinfo=this.UiByCode.ByGameAndColour[game_id][colour].PlayerInfo;

		if(username===this.owner) {
			plrinfo.Score.Set(this.score_owner);
		}

		else {
			plrinfo.Score.Set(this.score_guest);
		}
	}
}

LiveTable.prototype.update_result_display=function() {
	if(false /*this.CurrentPlayerGame!==null && this.CurrentPlayerGame.State===GAME_STATE_FINISHED*/) {
		this.ResultDisplay.Show();
		this.ResultDisplay.SetResult(this.CurrentPlayerGame.Result, this.CurrentPlayerGame.ResultDetails);
	}

	else {
		this.ResultDisplay.Hide();
	}
}

LiveTable.prototype.load_games=function() {
	/*
	load current games

	NOTE this passes the number of games required (1 for STD, 2 for BGH)
	to the xhr, which then gets a maximum of n games, with the latest
	mtime_start first.  this is the only way of not getting old games.

	if a game with the same gid as one we are about to load already exists,
	this leaves the old one alone.
	*/

	Base.LongPoll.Pause(function() {
		Xhr.QueryAsync(ap("/xhr/load_games.php"), function(response) {
			if(response!==false) {
				var row, gid, game_id, game;
				var board, history, clock;

				for(var i=0; i<response.length; i++) {
					row=response[i];
					gid=row["gid"];
					game_id=row["game_id"];

					if(!(gid in this.Games)) {
						pieces_taken=[
							this.PiecesTaken[WHITE],
							this.PiecesTaken[BLACK]
						]; //nulls if BGH (in which case update_pieces_taken sorts it out)

						for(var j=0; j<pieces_taken.length; j++) {
							if(pieces_taken[j]!==null) { //standard game, needs clearing out before each game
								pieces_taken[j].Clear();
							}
						}

						clock=this.UiByCode.ByGame[game_id].Clock;
						board=this.UiByCode.ByGame[game_id].Board;
						history=this.UiByCode.ByGame[game_id].History;

						history.Clear();
						history.ClearEventHandlers();
						clock.Reset();

						game=new LiveGame(this, gid, board, history, pieces_taken, clock);
						game.UserControl.Set(IGameCommon.USER_CONTROL_NONE);

						this.Games[gid]=game;
						this.GamesById[game_id]=game;

						game.Loaded.AddHandler(this, function(data, sender) {
							this.update_table_panel();
							this.update_game_user_control();
							this.update_current_player_game();
							this.update_rematch_buttons();
							this.update_pieces_taken();
							this.update_result_display();
							this.UpdateView();
							this.Update.Fire();

							return true;
						});

						game.GameOver.AddHandler(this, function(data, sender) {
							this.game_over(sender);

							return true;
						});

						game.Update.AddHandler(this, function(data, sender) {
							this.game_update(sender);
						});

						game.Moved.AddHandler(this, function(data, sender) {
							this.draw_offered_flag[sender.Gid]=false;
							this.game_update(sender);
						});

						/*
						call game_update on history update

						this has to be in the game Loaded handler because the game's
						History doesn't have the Update event until ILiveHistory has
						been implemented, which happens when the game loads.
						*/

						game.Loaded.AddHandler(this, function(data, sender) {
							sender.History.Update.AddHandler(this, (function(game) {
								return function(data, sender) {
									this.game_update(game);
								};
							})(sender));
						});
					}
				}
			}
		}, {
			"table": this.Id,
			"games": this.no_of_games
		}, this);
	}, this);
}

LiveTable.prototype.setup_comments=function() { //DEBUG .. this is basically debug code
	this.TableChatComments=new Comments(COMMENT_TYPE_TABLE, this.Id);

	this.TableChatComments.CommentReceived.AddHandler(this, function(comment) {
		this.TableChat.AddMessage("<b>"+comment["user"]+":</b> "+comment["body"]);
	});

	this.TableChat.MessageSent.AddHandler(this, function(data) {
		if(is_string(data.Message) && data.Message.length>0) {
			this.TableChat.AddMessage("<b>"+Base.App.User.Username+":</b> "+data.Message);
			this.TableChatComments.Post(data.Message);
		}
	});
}

LiveTable.prototype.setup_team_chat=function() {
	if(this.type===GAME_TYPE_BUGHOUSE) {
		this.BughousePartnerChat.MessageSent.AddHandler(this, function(data) {
			if(is_string(data.Message) && data.Message.length>0) {
				this.BughousePartnerChat.AddMessage("<b>"+Base.App.User.Username+":</b> "+data.Message);

				var partner=null;

				if(this.PlayerIsSeated.Get()) {
					var opp_game=Util.opp_game(this.PlayerSeat.GameId);
					var opp_colour=Util.opp_colour(this.PlayerSeat.Colour);

					partner=this.Seats[opp_game][opp_colour].Username.Get();
				}

				if(partner!==null) {
					Xhr.RunQueryAsync(ap("/xhr/team_chat.php"), {
						"table": this.Id,
						"partner": partner,
						"message": data.Message
					});
				}
			}
		});

		this.update_team_chat();
	}
}

LiveTable.prototype.setup_table_panel=function() {
	this.TablePanel.DropDownVariant.SelectionChanged.AddHandler(this, function(data) {
		this.variant=data.NewValue;
		this.update_table_panel();
		this.Save("variant");
	});

	this.TablePanel.DropDownChess960RandomiseMode.SelectionChanged.AddHandler(this, function(data) {
		this.chess960_randomise_mode=data.NewValue;
		this.Save("chess960_randomise_mode");
	});

	this.TablePanel.DropDownSubvariant.SelectionChanged.AddHandler(this, function(data) {
		this.subvariant=data.NewValue;
		this.Save("subvariant");
	});

	this.TablePanel.CheckboxRated.CheckedChanged.AddHandler(this, function(data, sender) {
		this.rated=sender.Checked.Get();
		this.Save("rated");
	});

	this.TablePanel.CheckboxAlternateColours.CheckedChanged.AddHandler(this, function(data, sender) {
		this.alternate_colours=sender.Checked.Get();
		this.Save("alternate_colours");
	});

	this.TablePanel.TimeSetting.Changed.AddHandler(this, function(data, sender) {
		this.timing_initial=sender.Initial.Get();
		this.timing_increment=sender.Increment.Get();
		this.timing_style=sender.Style.Get();
		this.timing_overtime=sender.Overtime.Get();
		this.timing_overtime_increment=sender.OvertimeIncrement.Get();
		this.timing_overtime_cutoff=sender.OvertimeCutoff.Get();
		this.update_clock_display();
		this.update_player_clocks();
		this.Save("timing_initial", "timing_increment", "timing_style", "timing_overtime", "timing_overtime_increment", "timing_overtime_cutoff");
	});

	if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
		this.TablePanel.CheckboxAlternateColours.Hide();
	}
}

LiveTable.prototype.setup_options_panel=function() {
	this.OptionsPanel.DropDownSize.SelectionChanged.AddHandler(this, function(data, sender) {
		for(var rel in this.UiByRel.ByGame) {
			this.UiByRel.ByGame[rel].Board.SquareSize.Set(sender.Value.Get());
		}
	});

	this.OptionsPanel.CheckboxShowCoords.CheckedChanged.AddHandler(this, function(data, sender) {
		for(var rel in this.UiByRel.ByGame) {
			this.UiByRel.ByGame[rel].Board.ShowCoords.Set(sender.Checked.Get());
		}
	});

	this.OptionsPanel.CheckboxLastMove.CheckedChanged.AddHandler(this, function(data, sender) {
		for(var gid in this.Games) {
			this.Games[gid].HighlightLastMove.Set(sender.Checked.Get());
		}
	});

	this.OptionsPanel.DropDownPieceStyle.SelectionChanged.AddHandler(this, function(data, sender) {
		for(var rel in this.UiByRel.ByGame) {
			this.UiByRel.ByGame[rel].Board.PieceStyle.Set(sender.Value.Get());
		}
	});
}

LiveTable.prototype.setup_game_panel=function() {
	var self=this;

	this.GamePanel.ButtonClaimFiftymove.Display.Set(false);
	this.GamePanel.ButtonClaimThreefold.Display.Set(false);

	this.GamePanel.ButtonResign.Click.AddHandler(this, function() {
		if(this.game_in_progress && this.PlayerSeat!==null) {
			this.CurrentPlayerGame.Resign();
		}
	});

	this.GamePanel.ButtonClaimFiftymove.Click.AddHandler(this, function() {
		if(this.game_in_progress && this.PlayerSeat!==null) {
			var gid=this.GamesById[this.PlayerSeat.GameId].Gid;

			Xhr.RunQueryAsync(ap("/xhr/claim_fiftymove.php"), {
				"gid": gid
			});
		}
	});

	this.GamePanel.ButtonClaimThreefold.Click.AddHandler(this, function() {
		if(this.game_in_progress && this.PlayerSeat!==null) {
			var gid=this.GamesById[this.PlayerSeat.GameId].Gid;

			Xhr.RunQueryAsync(ap("/xhr/claim_threefold.php"), {
				"gid": gid
			});
		}
	});

	this.GamePanel.ButtonDraw.Click.AddHandler(this, function() {
		if(this.game_in_progress && this.PlayerSeat!==null) {
			var game=this.GamesById[this.PlayerSeat.GameId];

			if(game.DrawOffered===Util.opp_colour(this.PlayerSeat.Colour)) {
				Xhr.RunQueryAsync(ap("/xhr/draw_accept.php"), {
					"gid": game.Gid
				});
			}

			else if(game.DrawOffered===null) {
				Xhr.RunQueryAsync(ap("/xhr/draw_offer.php"), {
					"gid": game.Gid
				});
			}
		}
	});

	this.GamePanel.ButtonUndo.Click.AddHandler(this, function() {
		if(this.game_in_progress && this.PlayerSeat!==null) {
			var gid=this.GamesById[this.PlayerSeat.GameId].Gid;

			Xhr.RunQueryAsync(ap("/xhr/undo_request.php"), {
				"gid": gid
			});
		}
	});

	this.GamePanel.ButtonReady.Click.AddHandler(this, function(data) {
		if(this.PlayerIsSeated.Get()) {
			this.hide_game_over_dialogs();
			this.Ready(!this.PlayerSeat.Ready.Get());
		}
	});

	this.GamePanel.ButtonRematch.Click.AddHandler(this, function() {
		if(this.PlayerIsSeated.Get()) {
			if(this.plr_rematch_ready) {
				this.CancelRematch();
			}

			else {
				this.Rematch();
				this.hide_game_over_dialogs();
			}
		}
	});

	this.GamePanel.ButtonDeclineRematch.Click.AddHandler(this, function() {
		if(this.PlayerIsSeated.Get()) {
			this.DeclineRematch();
		}
	});

	this.GamePanel.ButtonStand.Click.AddHandler(this, function() {
		this.Stand();
	});

	if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
		var time="untimed";

		if(this.TimingStyle.Get()!==TIMING_NONE) {
			time=ClockTimeDisplay.Encode(this.TimingStyle.Get(), this.TimingInitial.Get(), this.TimingIncrement.Get());
		}

		var button_new_text="New "+time;

		this.GamePanel.ButtonNew.Text.Set(button_new_text);
		this.GamePanel.CustomTableContainer.Hide();

		this.GamePanel.ButtonNew.Click.AddHandler(this, function() {
			if(this.NewQuickChallenge!==null && this.NewQuickChallenge.Waiting.Get()) {
				this.NewQuickChallenge.Cancel();
			}

			else {
				if(this.FromQuickChallenge!==null) { //create one exactly the same
					this.NewQuickChallenge=new QuickChallenge(
						this.FromQuickChallenge.Variant,
						this.FromQuickChallenge.TimingInitial,
						this.FromQuickChallenge.TimingIncrement,
						this.FromQuickChallenge.RatingMin,
						this.FromQuickChallenge.RatingMax,
						this.FromQuickChallenge.Rated,
						this.FromQuickChallenge.ChooseColour,
						this.FromQuickChallenge.ChallengeColour
					);
				}

				else { //we don't have all the info anymore so use some defaults
					this.NewQuickChallenge=new QuickChallenge(
						this.variant,
						this.timing_initial,
						this.timing_increment,
						"-200",
						"+200",
						this.rated,
						false
					);
				}

				this.NewQuickChallenge.Done.AddHandler(this, function(data, sender) {
					this.GamePanel.ButtonNew.Text.Set(button_new_text);

					if(data.Info===QuickChallenge.SUCCESS) {
						this.UserNewQuickChallenge.Fire({
							Id: data.Table,
							QuickChallenge: sender
						});

					}

					else if(data.Info===QuickChallenge.FAIL) {
						this.GamePanel.ButtonNew.Text.Set("No opponents found");

						setTimeout(function() {
							self.GamePanel.ButtonNew.Text.Set(button_new_text);
						}, 800);
					}
				});

				this.GamePanel.ButtonNew.Text.Set("<img src=\"/img/loading.gif\"> Cancel");

				this.NewQuickChallenge.Submit();
			}
		});
	}

	else {
		this.GamePanel.QuickChallengeContainer.Hide();
	}
}

LiveTable.prototype.Rematch=function() {
	if(!this.plr_rematch_ready) {
		this.plr_rematch_ready=true;
		this.update_rematch_buttons();

		Xhr.QueryAsync(ap("/xhr/rematch.php"), function(response) {
			if(response===false) {
				this.plr_rematch_ready=false;
				this.update_rematch_buttons();
			}
		}, {
			"table": this.Id
		}, this);
	}
}

LiveTable.prototype.CancelRematch=function() {
	if(this.plr_rematch_ready) {
		this.plr_rematch_ready=false;
		this.update_rematch_buttons();

		Xhr.QueryAsync(ap("/xhr/rematch_cancel.php"), function(response) {
			if(response===false) {
				this.plr_rematch_ready=true;
				this.update_rematch_buttons();
			}
		}, {
			"table": this.Id
		});
	}
}

LiveTable.prototype.DeclineRematch=function() {
	this.plr_rematch_ready=false;
	this.opp_rematch_ready=false;
	this.update_rematch_buttons();

	Xhr.RunQueryAsync(ap("/xhr/rematch_decline.php"), {
		"table": this.Id
	}, this);
}

LiveTable.prototype.update_team_chat=function() {
	if(this.BughousePartnerChat!==null) {
		this.BughousePartnerChat.Enabled.Set(this.PlayerSeat!==null);
	}
}

LiveTable.prototype.update_rematch_buttons=function() {
	var no_game_in_progress=(!this.game_in_progress);

	if(this.PlayerIsSeated.Get()) {
		this.GamePanel.ButtonRematch.Display.Set(this.Seats[this.PlayerSeat.GameId][Util.opp_colour(this.PlayerSeat.Colour)].Username.Get()!==null);
	}

	else {
		this.GamePanel.ButtonRematch.Display.Set(false);
	}

	this.GamePanel.ButtonRematch.Enabled.Set(no_game_in_progress);
	this.GamePanel.ButtonDeclineRematch.Display.Set(no_game_in_progress && this.opp_rematch_ready);
	this.GamePanel.ButtonRematch.Text.Set((no_game_in_progress && this.plr_rematch_ready?"Cancel":"Rematch"));
}

/*
respond to messages
*/

LiveTable.prototype.MessageRematchDeclined=function(sender) {
	this.TableChat.AddMessage("<b>"+sender+" has declined a rematch.</b>");
}

LiveTable.prototype.MessageRematchCancelled=function(sender) {
	this.TableChat.AddMessage("<b>"+sender+" has cancelled their rematch offer.</b>");
}

LiveTable.prototype.MessageOpponentConnected=function(sender) {
	if(this.opp_disconnected_flag[sender]) {
		this.TableChat.AddMessage("<b>"+sender+" has connected.</b>");
		this.opp_disconnected_flag[sender]=false;

		if(this.force_resign_timer!==null) {
			clearTimeout(this.force_resign_timer);
		}

		this.UiByRel.ByGame.Player.Board.ForceResignDialog.Hide();
	}
}

LiveTable.prototype.MessageOpponentDisconnected=function(sender) {
	if(!this.opp_disconnected_flag[sender]) {
		var self=this;
		var opponent=this.Seats[this.PlayerSeat.GameId][Util.opp_colour(this.PlayerSeat.Colour)].Username.Get();

		this.TableChat.AddMessage("<b>"+sender+" has disconnected.</b>");
		this.opp_disconnected_flag[sender]=true;

		if(
			this.game_in_progress
			&& this.timing_initial<=LONGEST_GAME_TO_RESIGN_IF_QUIT
			&& this.PlayerIsSeated.Get()
			&& sender===opponent
		) {
			this.force_resign_timer=setTimeout(function() {
				self.show_force_resign_dialog();
				self.force_resign_timer=null;
			}, MIN_DC_TIME_TO_FORCE_RESIGN*MSEC_PER_SEC);
		}
	}
}

LiveTable.prototype.MessageTeamChat=function(sender, body) {
	this.BughousePartnerChat.AddMessage("<b>"+sender+":</b> "+body);
}

LiveTable.prototype.show_force_resign_dialog=function() {
	if(this.game_in_progress && this.PlayerIsSeated.Get()) {
		this.UiByRel.ByGame.Player.Board.ForceResignDialog.Show();
	}
}

LiveTable.prototype.force_resign=function() {
	if(this.game_in_progress && this.PlayerIsSeated.Get()) {
		this.UiByRel.ByGame.Player.Board.ForceResignDialog.Hide();

		Xhr.RunQueryAsync(ap("/xhr/force_resignation.php"), {
			"gid": this.CurrentPlayerGame.Gid
		});
	}
}

LiveTable.prototype.hide_game_over_dialogs=function() {
	for(var rel in this.GameIdByRel) {
		this.UiByRel.ByGame[rel].Board.GameOverDialog.Hide();
	}
}

LiveTable.prototype.update_ratings=function() {
	for(var rel in this.UiByRel.ByGameAndPlayer) {
		for(var plr in this.UiByRel.ByGameAndPlayer[rel]) {
			this.UiByRel.ByGameAndPlayer[rel][plr].PlayerInfo.LoadRating(
				this.type,
				this.variant,
				Timing.GetFormat(
					this.timing_style,
					this.timing_initial,
					this.timing_increment,
					this.timing_overtime,
					this.timing_overtime_increment,
					this.timing_overtime_cutoff
				)
			);
		}
	}
}

/*
hide the clocks for timing_style TIMING_NONE
*/

LiveTable.prototype.update_clock_display=function() {
	for(var rel in this.UiByRel.ByGameAndPlayer) {
		for(var prel in this.UiByRel.ByGameAndPlayer[rel]) {
			if(this.timing_style===TIMING_NONE) {
				this.UiByRel.ByGameAndPlayer[rel][prel].PlayerClock.Hide();
			}

			else {
				this.UiByRel.ByGameAndPlayer[rel][prel].PlayerClock.Show();
			}
		}
	}
}

/*
make it so the user can't try moving on the other bughouse game
*/

LiveTable.prototype.update_game_user_control=function() {
	var game;

	for(var gid in this.Games) {
		game=this.Games[gid];
		game.UserControl.Set(IGameCommon.USER_CONTROL_NONE);

		if(this.PlayerSeat!==null) {
			if(this.PlayerSeat.GameId===game.GameId) {
				game.UserControl.Set(IGameCommon.USER_CONTROL_PLAYER);
				game.UserColour.Set(this.PlayerSeat.Colour);
			}
		}
	}
}

/*
if no game in progress, player clocks should always be set to whatever
the table's initial time is
*/

LiveTable.prototype.update_player_clocks=function() {
	if(this.html_is_setup && !this.game_in_progress) {
		for(var rel in this.UiByRel.ByGameAndPlayer) {
			for(var prel in this.UiByRel.ByGameAndPlayer[rel]) {
				this.UiByRel.ByGameAndPlayer[rel][prel].PlayerClock.Mtime.Set(this.timing_initial*MSEC_PER_SEC);
			}
		}
	}
}

/*
get a title for the table based on game details, whether the
player is sat down etc.
*/

LiveTable.prototype.GetTitle=function() {
	var display_time=false;
	var time, title;
	var label=DbEnums[VARIANT][this.Variant.Get()].Description;

	if(this.type===GAME_TYPE_BUGHOUSE) {
		label=DbEnums[GAME_TYPE][this.type].Description+" "+label;

		if(this.game_in_progress) {
			var game, other;

			if(this.CurrentPlayerGame!==null) {
				game=this.CurrentPlayerGame;

				label=game.White+" vs. "+game.Black;

				if(game.BughouseOtherGame in this.Games) {
					other=this.Games[game.BughouseOtherGame];
					label+="; "+other.White+" vs. "+other.Black;
				}
			}
		}
	}

	else {
		if(this.PlayerSeat===null) {
			if(this.CurrentPlayerGame!==null) {
				label=this.CurrentPlayerGame.White+" vs. "+this.CurrentPlayerGame.Black;
			}
		}

		else {
			if(this.HtmlIsSetup.Get()) {
				var plrinfo_opp=this.UiByRel.ByGameAndPlayer.Player.Opponent.PlayerInfo;

				if(plrinfo_opp.Username.Get()!==null) {
					label=plrinfo_opp.Username.Get();
				}
			}
		}
	}

	if(this.timing_style!==TIMING_NONE) {
		display_time=true;

		if(this.GameInProgress.Get() && this.PlayerSeat!==null) {
			time=this.UiByRel.ByGameAndPlayer.Player.Player.PlayerClock.DisplayTime.Get();
		}

		else {
			time=ClockTimeDisplay.Encode(this.timing_style, this.timing_initial, this.timing_increment, this.timing_overtime_cutoff);
		}
	}

	title=label;

	if(display_time) {
		title+=" "+time;
	}

	if(this.CurrentPlayerGame!==null && this.CurrentPlayerGame.State===GAME_STATE_FINISHED && this.type!==GAME_TYPE_BUGHOUSE) {
		title+=" ("+Result.String[this.CurrentPlayerGame.Result]+")";
	}

	return title;
}

LiveTable.prototype.game_update=function(game) {
	if(game.DrawOffered!==null) {
		if(this.html_is_setup) {
			if(!this.draw_offered_flag[game.Gid]) {
				if(game===this.CurrentPlayerGame && this.PlayerIsSeated.Get()) {
					if(game.Position.Active===this.PlayerSeat.Colour) {
						var opp_seat=this.Seats[this.PlayerSeat.GameId][Util.opp_colour(this.PlayerSeat.Colour)];

						this.TableChat.AddMessage("<b>"+opp_seat.Username.Get()+" has offered you a draw.</b>");
					}
				}

				else {
					var usernames=[
						game.White,
						game.Black
					];

					this.TableChat.AddMessage(
						usernames[Util.opp_colour(game.Position.Active)],
						" has offered ",
						usernames[game.Position.Active],
						" a draw."
					);
				}

				this.draw_offered_flag[game.Gid]=true;
			}
		}
	}

	this.update_game_panel();
}

/*
for bughouse - update which game adds to the pieces taken control
and which one accepts drag and drops from it
*/

LiveTable.prototype.update_pieces_taken=function() {
	if(this.type===GAME_TYPE_BUGHOUSE && this.games_loaded) {
		var game_id, opp_game, colour, opp_colour, pa, pt;


		for(var rel in this.UiByRel.ByGameAndPlayer) {
			for(var plr in this.UiByRel.ByGameAndPlayer[rel]) {
				game_id=this.GameIdByRel[rel];
				colour=this.ColourByRel[game_id][plr];
				opp_game=Util.opp_game(game_id);
				opp_colour=Util.opp_colour(colour);

				pa=this.UiByCode.ByGameAndColour[game_id][colour].BughousePiecesAvailable;

				pa.Clear();
				pa.Colour.Set(colour);

				this.GamesById[game_id].SetBughousePiecesAvailable(pa, colour);
				this.GamesById[opp_game].SetPiecesTaken(pa, colour);
			}
		}
	}
}

LiveTable.prototype.update_ready_button=function() {
	if(this.PlayerIsSeated.Get() && this.PlayerSeat.Ready.Get() && !this.game_in_progress) {
		this.GamePanel.ButtonReady.Text.Set("Cancel");
	}

	else {
		this.GamePanel.ButtonReady.Text.Set("Ready");
	}
}

/*
this happens on load if there is a finished game
*/

LiveTable.prototype.game_over=function(game) {
	this.update_table_panel();
	this.update_result_display();

	/*
	Bughouse - a dialog is only shown for the game that ends properly.

	the other game just has its ResultDisplay set to indicate that it
	was ended by the other game.
	*/

	if(game.ResultDetails!==RESULT_DETAILS_BUGHOUSE_OTHER_GAME) {
		var god=game.Board.GameOverDialog;

		god.Show();
		god.Update(game);
	}

	if(this.challenge_type===CHALLENGE_TYPE_QUICK) {
		/*
		NOTE if there is a finished game on the table on load, this will reset
		everything as though no one has offered a rematch.  only real effect will
		be that if you refresh it after sending a rematch offer you'll have to
		click Rematch again to be able to cancel it.
		*/

		this.owner_rematch_ready=false;
		this.guest_rematch_ready=false;
		this.plr_rematch_ready=false;
		this.opp_rematch_ready=false;
		this.update_rematch_buttons();
	}

	else if(this.challenge_type===CHALLENGE_TYPE_CUSTOM) {
		/*
		NOTE same issue as above with quick challenges
		*/

		if(this.PlayerIsSeated.Get()) {
			this.PlayerSeat.Ready.Set(false);
			this.update_ready_button();
		}
	}

	this.Update.Fire();
}

LiveTable.prototype.Leave=function() {
	this.PlayerPresent=false;

	Xhr.QueryAsync(ap("/xhr/leave.php"), function() {
		this.Update.Fire();
	}, {
		"table": this.Id
	}, this);
}

LiveTable.prototype.Die=function() {
	this.ClearEventHandlers();

	for(var gid in this.Games) {
		this.Games[gid].Die();
	}

	var colours=[WHITE, BLACK];

	for(var game_id=0; game_id<this.Seats.length; game_id++) {
		for(var c=0; c<colours.length; c++) {
			colour=colours[c];

			this.Seats[game_id][colour].Die();
		}
	}

	if(this.html_is_setup) {
		this.TableChatComments.Die();
	}

	this.Dead.Fire();
}
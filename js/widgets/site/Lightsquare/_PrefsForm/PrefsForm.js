define(function(require) {
	require("css!./prefs_form.css");
	var html = require("file!./prefs_form.html");
	var Ractive = require("lib/dom/Ractive");
	var Piece = require("widgets/chess/Piece/Piece");
	var Board = require("widgets/chess/Board/Board");
	var Square = require("chess/Square");
	
	function PrefsForm(user, parent) {
		this._user = user;
		this._setupTemplate(parent);
		
		this._user.LoggedIn.addHandler(this, function() {
			this._updatePrefs();
		});
		
		this._user.LoggedOut.addHandler(this, function() {
			this._updatePrefs();
		});
	}
	
	PrefsForm.prototype._setupTemplate = function(parent) {
		var boardStyles = [];
		var boardSizes = [];
		var pieceStyles = Piece.styles;
		var prefs = this._user.getPrefs();
		
		for(var style in Board.squareStyles) {
			boardStyles.push({
				code: Board.squareStyles[style],
				label: style
			});
		}
		
		for(var size in Board.sizes) {
			boardSizes.push({
				code: Board.sizes[size],
				label: size
			});
		}
		
		boardSizes.shift();
		
		this._template = new Ractive({
			template: html,
			el: parent,
			data: {
				pieceStyles: pieceStyles,
				boardSizes: boardSizes,
				boardStyles: boardStyles,
				prefs: {}
			}
		});
		
		this._template.on("save", (function() {
			this._user.updatePrefs({
				alwaysQueen: this._template.nodes.alwaysQueen.checked,
				premove: this._template.nodes.premove.checked,
				boardStyle: this._template.nodes.boardStyle.value,
				boardSize: parseInt(this._template.nodes.boardSize.value),
				pieceStyle: this._template.nodes.pieceStyle.value
			});
		}).bind(this));
		
		this._updatePrefs();
	}
	
	PrefsForm.prototype._updatePrefs = function() {
		var prefs = this._user.getPrefs();
		
		this._template.set("prefs", {
			alwaysQueen: !!prefs.alwaysQueen,
			premove: !!prefs.premove,
			boardStyle: (prefs.boardStyle || Board.DEFAULT_SQUARE_STYLE),
			boardSize: (prefs.boardSize || Board.DEFAULT_SQUARE_SIZE),
			pieceStyle: (prefs.pieceStyle || Piece.DEFAULT_STYLE)
		});
	}
	
	return PrefsForm;
});
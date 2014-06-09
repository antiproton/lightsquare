define(function(require) {
	require("css!./profile_page.css");
	var html = require("file!./profile_page.html");
	var Ractive = require("lib/dom/Ractive");
	var Piece = require("widgets/chess/Piece/Piece");
	var Board = require("widgets/chess/Board/Board");
	var Square = require("chess/Square");
	var ChessPiece = require("chess/Piece");
	
	function ProfilePage(user, parent) {
		this._user = user;
		
		this._setupTemplate(parent);
		
		this._user.DetailsChanged.addHandler(this, function() {
			this._template.update();
		});
		
		this._user.HasIdentity.addHandler(this, function() {
			this._template.update();
		});
	}
	
	ProfilePage.prototype._setupTemplate = function(parent) {
		var boardStyles = [];
		var boardSizes = [];
		var pieceStyles = Piece.styles;
		
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
		
		this._template = new Ractive({
			template: html,
			el: parent,
			data: {
				user: this._user,
				pieceStyles: pieceStyles,
				boardSizes: boardSizes,
				boardStyles: boardStyles
			}
		});
		
		this._template.on("save", (function(event, pref) {
			var prefs = {};
			
			prefs[pref] = this._template.get(pref);
			
			this._user.updatePreferences(prefs);
			this._updatePreviewBoard();
		}).bind(this));
		
		this._setupPreviewBoard();
	}
	
	ProfilePage.prototype._setupPreviewBoard = function() {
		this._previewBoard = new Board(this._template.nodes.preview_board);
		this._previewBoard.setShowCoords(false);
		this._previewBoard.setPiece(Square.a8, ChessPiece.fromFenString("P"));
	}
	
	ProfilePage.prototype._updatePreviewBoard = function() {
		var prefs = this._user.getPreferences();
		
		this._previewBoard.setSquareSize(prefs.boardSize);
		this._previewBoard.setSquareStyle(prefs.boardStyle);
		this._previewBoard.setPieceStyle(prefs.pieceStyle);
	}
	
	return ProfilePage;
});
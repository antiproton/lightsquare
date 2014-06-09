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
			this._updatePrefs();
		});
	}
	
	ProfilePage.prototype._setupTemplate = function(parent) {
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
				user: this._user,
				pieceStyles: pieceStyles,
				boardSizes: boardSizes,
				boardStyles: boardStyles,
				prefs: {}
			}
		});
		
		this._template.on("saveAlwaysQueen", (function() {
			this._user.updatePrefs({
				alwaysQueen: this._template.nodes.alwaysQueen.checked
			});
			
			this._updatePreviewBoard();
		}).bind(this));
		
		this._template.on("saveBoardStyle", (function() {
			this._user.updatePrefs({
				boardStyle: this._template.nodes.boardStyle.value
			});
			
			this._updatePreviewBoard();
		}).bind(this));
		
		this._template.on("saveBoardSize", (function() {
			this._user.updatePrefs({
				boardSize: parseInt(this._template.nodes.boardSize.value)
			});
			
			this._updatePreviewBoard();
		}).bind(this));
		
		this._template.on("savePieceStyle", (function() {
			this._user.updatePrefs({
				pieceStyle: this._template.nodes.pieceStyle.value
			});
			
			this._updatePreviewBoard();
		}).bind(this));
		
		this._setupPreviewBoardOverlay();
		this._setupPreviewBoard();
		this._updatePreviewBoard();
	}
	
	ProfilePage.prototype._updatePrefs = function() {
		var prefs = this._user.getPrefs();
		
		this._template.set("prefs", {
			alwaysQueen: !!prefs.alwaysQueen,
			boardStyle: (prefs.boardStyle || Board.DEFAULT_SQUARE_STYLE),
			boardSize: (prefs.boardSize || Board.DEFAULT_SQUARE_SIZE),
			pieceStyle: (prefs.pieceStyle || Piece.DEFAULT_STYLE)
		});
		
		this._updatePreviewBoard();
	}
	
	ProfilePage.prototype._setupPreviewBoardOverlay = function() {
		this._template.nodes.preview_board_overlay.style.backgroundImage = "url('" + require.toUrl("./preview_board_overlay.png") + "')";
	}
	
	ProfilePage.prototype._setupPreviewBoard = function() {
		this._previewBoard = new Board(this._template.nodes.preview_board);
		this._previewBoard.setShowCoords(false);
		this._previewBoard.setPiece(Square.a8, ChessPiece.fromFenString("P"));
		this._previewBoard.setPiece(Square.b8, ChessPiece.fromFenString("Q"));
		this._previewBoard.setPiece(Square.a7, ChessPiece.fromFenString("q"));
		this._previewBoard.setPiece(Square.b7, ChessPiece.fromFenString("p"));
	}
	
	ProfilePage.prototype._updatePreviewBoard = function() {
		var prefs = this._user.getPrefs();
		
		if(prefs.boardSize) {
			this._previewBoard.setSquareSize(parseInt(prefs.boardSize));
		}
		
		if(prefs.boardStyle) {
			this._previewBoard.setSquareStyle(prefs.boardStyle);
		}
		
		if(prefs.pieceStyle) {
			this._previewBoard.setPieceStyle(prefs.pieceStyle);
		}
	}
	
	return ProfilePage;
});
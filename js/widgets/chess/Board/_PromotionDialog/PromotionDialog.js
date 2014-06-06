define(function(require) {
	require("css!./promotionDialog.css");
	var html = require("file!./promotionDialog.html");
	var Ractive = require("lib/dom/Ractive");
	var PieceType = require("chess/PieceType");
	var Event = require("lib/Event");;
	
	function PromotionDialog(parent) {
		this.PieceSelected = new Event(this);
		
		this._template = new Ractive({
			el: parent,
			template: html,
			data: {
				pieceTypes: [PieceType.queen, PieceType.rook, PieceType.bishop, PieceType.knight]
			}
		});
		
		this._template.on("select", (function(event, type) {
			this.PieceSelected.fire({
				type: type
			});
		}).bind(this));
	}
	
	return PromotionDialog;
});
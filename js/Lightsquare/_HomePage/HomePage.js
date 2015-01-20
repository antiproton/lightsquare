define(function(require) {
	require("css!./home_page.css");
	var html = require("file!./home_page.html");
	var Ractive = require("ractive/ractive");
	var SeekForm = require("./_SeekForm/SeekForm");
	var SeekGraph = require("./_SeekGraph/SeekGraph");
	var Chat = require("./_Chat/Chat");
	var jsonchessMessageTypes = require("jsonchess/chatMessageTypes");
	var SeekList = require("lightsquare/SeekList");
	
	function HomePage(user, server, parent) {
		this._user = user;
		this._server = server;
		this._seekList = new SeekList(this._server);
		this._setupTemplate(parent);
	}
	
	HomePage.prototype._setupTemplate = function(parent) {
		this._template = new Ractive({
			el: parent,
			template: html
		});
		
		new SeekForm(this._user, this._server, this._template.nodes.create_seek);
		new SeekGraph(this._seekList, this._user, this._template.nodes.seek_graph);
		
		var chat = new Chat(this._user, this._server, this._template.nodes.chat);
		
		this._server.getConnection().then((function() {
			setTimeout((function() {
				chat.addMessage({
					body: this._user.__("Welcome to Lightsquare!"),
					type: jsonchessMessageTypes.ADMIN
				});
			}).bind(this), Math.round(100 + Math.random() * 100));
			
			setTimeout((function() {
				chat.addMessage({
					body: this._user.__("To find an opponent click Start game, or accept a seek from the graph."),
					type: jsonchessMessageTypes.USER
				});
			}).bind(this), Math.round(400 + Math.random() * 100));
		}).bind(this));
	}
	
	HomePage.prototype.show = function() {
		this._seekList.startUpdating();
	}
	
	HomePage.prototype.hide = function() {
		this._seekList.stopUpdating();
	}
	
	return HomePage;
});
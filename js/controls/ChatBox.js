/*
NOTE this doesn't have any connection to the server - multiple other
components on the client can add to its message list when they get updates,
and something needs to handle its MessageSent event to send user messages
to the server.
*/

function ChatBox(parent) {
	Control.implement(this, parent);

	this.MessageSent=new Event(this);

	this.width=null;
	this.enabled=true;

	this.Enabled=new Property(this, function() {
		return this.enabled;
	}, function(value) {
		this.enabled=value;
		this.UpdateHtml();
	});

	this.Width=new Property(this, function() {
		return this.width;
	}, function(value) {
		this.width=value;
		this.UpdateHtml();
	});

	this.SetupHtml();
}

ChatBox.prototype.SetupHtml=function() {
	this.inner_container=div(this.Node);

	//Dom.Style(this.Node, {
	//	backgroundColor: "#ffffff"
	//});

	this.messages_container=div(this.inner_container);

	Dom.Style(this.messages_container, {
		fontSize: 11,
		color: "#303030",
		border: "1px solid #cbcbcb",
		height: 80,
		//borderRadius: 2,
		padding: 5,
		overflowX: "hidden", //NOTE long messages get cut off
		overflowY: "auto",
		backgroundColor: "#ffffff"
	});

	this.controls_container=div(this.inner_container);

	//Dom.Style(this.controls_container, {
	//	padding: "2px 2px 1px 3px"
	//});

	this.TextBoxMessage=new TextBox(this.controls_container);
	this.ButtonSend=new Button(this.controls_container, "Send");

	//Dom.AddClass(this.TextBoxMessage.InputNode, "input_no_focus_outline");

	//Dom.Style(this.TextBoxMessage.InputNode, {
	//	width: "100%",
	//	border: 0
	//});

	this.TextBoxMessage.Width.Set(200);

	Dom.Style(this.controls_container, {
		marginTop: 1
	});

	Dom.AddEventHandler(this.Node, "click", function() {
		this.TextBoxMessage.Focus();
	}, this);

	this.ButtonSend.Click.AddHandler(this, function() {
		this.send_message();
	});

	this.TextBoxMessage.KeyPress.AddHandler(this, function(e) {
		if(e.keyCode===13) {
			this.send_message();
		}
	});

	this.UpdateHtml();
}

ChatBox.prototype.UpdateHtml=function() {
	if(this.width!==null) {
		Dom.Style(this.Node, {
			width: this.width
		});

		Dom.Style(this.TextBoxMessage.InputNode, {
			width: this.width-70
		});

		Dom.Style(this.ButtonSend.InputNode, {
			width: 55
		});
	}

	else {
		Dom.Style(this.Node, {
			width: "auto"
		});
	}

	this.TextBoxMessage.Enabled.Set(this.enabled);
	this.ButtonSend.Enabled.Set(this.enabled);
}

/*
AddMessage - pass strings or html elements to be added to the message in order

e.g.

var allow=$("*a");
allow.innerHTML="Allow";
allow.onclick=accept_undo;

var deny=$("*a");
deny.innerHTML="Deny";
deny.onclick=reject_undo;

chat.AddMessage("Opponent requested undo.  ", allow, "/", deny);

The message would be:

	Opponent has requested undo.  Allow/Deny
*/

ChatBox.prototype.AddMessage=function() { //variable args
	var tmp=div(this.messages_container);
	var arg;
	var span;

	for(var i=0; i<arguments.length; i++) {
		arg=arguments[i];

		if(is_string(arg)) { //html string
			span=$("*span");
			tmp.appendChild(span);
			span.innerHTML=arg;
		}

		else { //html node
			tmp.appendChild(arg);
		}
	}

	Dom.Style(tmp, {
		paddingBottom: 3
	});

	this.messages_container.scrollTop=this.messages_container.scrollHeight;
}

ChatBox.prototype.send_message=function() {
	this.MessageSent.Fire({
		Message: this.TextBoxMessage.Value.Get()
	});

	this.TextBoxMessage.Value.Set("");
	this.TextBoxMessage.InputNode.focus();
}
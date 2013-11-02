function TableList(parent) {
	Control.implement(this, parent);

	this.filters={};

	this.timer=null;
	this.update_interval=2000;

	this.SetupHtml();

	this.UpdateInterval=new Property(this, function() {
		return this.update_interval;
	}, function(value) {
		this.update_interval=value;
		this.init_updates();
	});

	this.init_updates();
}

TableList.prototype.SetupHtml=function() {
	this.border_container=div(this.Node);
	this.panel_container=div(this.border_container);
	this.list_container=div(this.border_container);

	Dom.Style(this.border_container, {
		height: 300, //DEBUG
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#9f9f9f"
	});

	Dom.Style(this.panel_container, {
		backgroundColor: "#f0f0f0"
	});

	this.list_inner=div(this.list_container);

	Dom.Style(this.list_container, {
		width: "100%",
		height: "100%",
		overflowY: "scroll"
	});

	this.UpdateHtml();
}

TableList.prototype.UpdateHtml=function() {

}

TableList.prototype.stop_updates=function() {
	if(this.timer!==null) {
		clearInterval(this.timer);
	}
}

TableList.prototype.init_updates=function() {
	var self=this;
	this.stop_updates();
	this.UpdateList();

	this.timer=setInterval(function() {
		self.UpdateList();
	}, this.update_interval);
}

TableList.prototype.add_row=function(row) {
	var item=new TableListItem(row);
	this.list_inner.appendChild(item.Node);
	item.SetupHtml();
}

TableList.prototype.clear_list=function() {
	Dom.ClearNode(this.list_inner);
}

/*
TODO [/] Disable updating while mouse over
*/

TableList.prototype.UpdateList=function() {
	Xhr.QueryAsync(ap("/xhr/table_list.php"), function(response) {
		if(response!==null) {
			var table;
			this.clear_list();

			for(var i=0; i<response.length; i++) {
				row=response[i];

				this.add_row(row);
			}
		}
	}, {
		filters: this.filters
	}, this);
}
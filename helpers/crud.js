define([
	"locale"
],function(_){

	var delete_column = { width:37, id:"crud:remove", header:"", template:"<span class='webix_icon fa-trash-o'></span>" };
	var delete_handler = function(data){
		return { 
			"fa-trash-o":function(ev, id){
				webix.confirm({
					text:_("Crud.NoUndoMessage"),
					ok:_("OK"),
					cancel:_("Cancel"),
					callback:function(res){
						if (res){
							var target = typeof data === "string" ? webix.$$(data) : data;
							target.remove(id.row);
						}
					}
				});	
			}
		};
	};

	var empty_template = function(obj, common, value){
		if (value === null) return "";
		return value;
	};

	var add_button = function(callback){
		return { 
			view:"button", maxWidth:200, value:_("Crud.AddNew"), click:callback
		};
	};

	function crud_collection(data, fields, name, params){
		var id = webix.uid().toString();
		if (data === null) data = id;

		var columns = [ delete_column ];
		for (var i = 0; i < fields.length; i++){
			var next = fields[i];
			if (typeof next === "string")
				columns[i+1] = { id:next, editor:"text", sort:"string", fillspace:1, template: empty_template};
			else
				columns[i+1] = next;
		}

		var table = {
			view:"datatable", columns:columns, id:id, scrollX:false,
			editable:true,
			onClick:delete_handler(data)
		};

		if (params)
			for (var key in params)
				table[key] = params[key];

		var toolbar = {
			view:"toolbar", elements:[
				{ view:"label", label:(name||"") },
				add_button(function(){
					var view = data;
					if (typeof view === "string")
						view = webix.$$(data);

					var nid = view.add({});
					var grid = $$(id);

					grid.showItem(nid);
					var columns = grid.config.columns;
					for (var i = 0; i < columns.length; i++) {
						if (columns[i].editor && columns[i].editor != "inline-checkbox"){
							grid.editCell(nid, grid.config.columns[i].id);
							return;
						}
					}
				})
			]
		};

		return {
			$ui:{ type:"clean", rows:[ toolbar, table ] },
			$oninit:function(){
				if (data != id)
					$$(id).sync(data);
			}
		};
	}

	function crud_model(data, fields){
		webix.message(_("Crud.NotImplementedMessage"));
	}

	return {
		collection: crud_collection,
		model: crud_model,
		remove:{
			column: delete_column,
			handler: delete_handler
		},
		add:{
			button: add_button
		}
	};
});
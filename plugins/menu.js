"use strict";
define([], function(){

	function select_menu(menu_id, id){
		var menu = $$(menu_id);
		if (menu.setValue)
			menu.setValue(id);
		else if (menu.select && menu.exists(id))
			menu.select(id);
	}

	function get_menu(scope){
		if (scope.parent)
			return scope.parent.module.$menu || get_menu(scope.parent);
	}

	return {
		$onurlchange:function(ui, name, url, scope){
			//menu handling
			if (ui.$menuid){
				var id = ui.$menuid.call ? ui.$menuid.call(ui, ui, name, url) : ui.$menuid;
				var menu = get_menu(scope);
				if (menu && id)
					select_menu(menu, id);
			}
		},

		$onui:function(ui, name, url, scope){
			//menu handling
			if (ui.$menu && url.length){
				var id = url[0].page;
				if (id.indexOf(".") === 0)
					id = id.substr(1);
				select_menu(ui.$menu, id);
			}
		}
	}
});
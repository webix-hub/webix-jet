define(function(){

	var key = "--:app:theme";
	function _get_theme(){
		var data = (webix.storage.local.get(key) || "siberia:webix").split(":");
		return {
			skin:data[1],
			name:data[0]
		};
	}

	function _set_theme(name, skin){
		if (arguments.length == 1){
			var parts = name.split(":");
			name = parts[0];
			skin = parts[1];
		}

		var now = _get_theme();
		if (now.skin != skin || now.name != name){
			webix.storage.local.put(key, name+":"+skin);
			document.location.reload();
		}
	}

	return {
		$oninit: function(app, config){
			key = (app.config.id || "") + key;
		},

		setTheme: _set_theme,
		getTheme: _get_theme,
		getThemeId: function(){
			var theme = _get_theme();
			return theme.name + ":" + theme.skin;
		}
	};
});
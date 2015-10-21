"use strict";
define([
	"libs/polyglot/build/polyglot"
], function(){

	var defaultlang = "en";
	var key = "--:app:lang";

	function _get_lang(){
		return webix.storage.local.get(key);
	}
	function _set_lang(lang){
		if (lang != _get_lang()){
			webix.storage.local.put(key, lang);
			document.location.reload();
		}
	}

	function create_locale(lang){
		define("locale", [
			"locales/"+lang,
			"libs/webix/locales/"+lang
		], function(data){
			var poly = new Polyglot({ phrases:data });
				poly.locale(lang);

			webix.i18n.setLocale(lang);
			return webix.bind(poly.t, poly);
		});
	}

	return {
		$oninit:function(app, config){
			key = (app.config.id || "")+key;

			var lang = _get_lang() || config.lang || defaultlang;
			_set_lang(lang);
			create_locale(lang);
		},

		setLang: _set_lang,
		getLang: _get_lang
	};
});
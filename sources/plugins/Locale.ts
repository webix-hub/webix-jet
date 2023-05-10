import Polyglot from "webix-polyglot";
import {IJetApp, IJetView} from "../interfaces";

export function Locale(app: IJetApp, _view: IJetView, config: any){
	config = config || {};
	const storage = config.storage;
	let lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");

	function setLangData(name, data: any, silent?: boolean) : Promise<any>{
		if (data.__esModule) {
			data = data.default;
		}

		const pconfig = { phrases:data };
		if (config.polyglot){
			app.webix.extend(pconfig, config.polyglot);
		}

		const poly = service.polyglot = new Polyglot(pconfig);
		poly.locale(name);

		service._ = app.webix.bind(poly.t, poly);
		lang = name;

		if (storage){
			storage.put("lang", lang);
		}

		if (config.webix){
			const locName = config.webix[name];
			if (locName){
				app.webix.i18n.setLocale(locName);
			}
		}

		if (!silent){
			return app.refresh();
		}

		return Promise.resolve();
	}
	function getLang(){ return lang; }
	function setLang(name:string, silent? : boolean){
		// ignore setLang if loading by path is disabled
		if (config.path === false){
			return;
		}

		const path = (config.path ? config.path + "/" : "") + name;
		const data = app.require("jet-locales",path);

		setLangData(name, data, silent);
	}

	const service = {
		getLang, setLang, setLangData, _:null, polyglot:null
	};

	app.setService("locale", service);
	setLang(lang, true);
}
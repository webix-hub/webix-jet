import Polyglot from "node-polyglot/build/polyglot";
import {IJetApp, IJetView} from "../interfaces";

declare function require(name:string):any;

export function Locale(app: IJetApp, _view: IJetView, config: any){
	config = config || {};
	const storage = config.storage;
	let lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");


	const service = {
		_:null,
		polyglot: null,
		getLang(){ return lang; },
		setLang(name:string, silent? : boolean){
			const path = (config.path ? config.path + "/" : "") + name;
			let data = require("jet-locales/"+path);
			if (data.__esModule) {
				data = data.default;
			}

			const poly = service.polyglot = new Polyglot({ phrases:data });
			poly.locale(name);

			service._ = webix.bind(poly.t, poly);
			lang = name;

			if (storage){
				storage.put("lang", lang);
			}
			if (!silent){
				app.refresh();
			}
		}
	};

	app.setService("locale", service);
	service.setLang(lang, true);
}
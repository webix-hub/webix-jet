import {IJetApp, IJetView} from "../interfaces";
import Polyglot from "node-polyglot/build/polyglot";

declare function require(name:string):any;

export function Locale(app: IJetApp, view: IJetView, config: any){
	config = config || {};
	const storage = config.storage;
	let lang = storage ? storage.get("lang") : ( config.lang || "en" );


	const service = {
		_:null,
		polyglot: null,
		getLang(){ return lang; },
		setLang(name:string, silent? : boolean){
			let data = require("jet-locales/"+name);
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
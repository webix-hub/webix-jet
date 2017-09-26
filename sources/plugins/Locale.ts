import {IJetApp, IJetView} from "../interfaces";
import Polyglot from "node-polyglot/build/polyglot";

declare function require(name:string):any;

export function Locale(app: IJetApp, view: IJetView, config: any){
	config = config || {};
	let lang = config.lang || "en";

	const service = {
		_:null,
		polyglot: null,
		getLang(){ return lang; },
		setLang(name:string){
			const data = require("jet-locales/"+name);
			const poly = service.polyglot = new Polyglot({ phrases:data });
			poly.locale(name);

			service._ = webix.bind(poly.t, poly);
			lang = name;
		}
	};

	app.setService("locale", service);
	service.setLang(lang);
}
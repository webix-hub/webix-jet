import {IJetApp, IJetURL, IJetView} from "../interfaces";

export function Theme(app: IJetApp, view: IJetView, config: any){
	config = config || {};
	const storage = config.storage;
	let theme = storage ? storage.get("theme") : (config.theme || "flat");

	const service = {
		getTheme(){ return theme; },
		setTheme(name:string, silent?:boolean){
			// document.location.reload();
			theme = name;
			if (storage){
				storage.put("theme", name);
			}
			if (!silent){
				app.refresh();
			}
		}
	};

	app.setService("theme", service);
	service.setTheme(theme, true);
}
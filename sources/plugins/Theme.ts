import {IJetApp, IJetURL, IJetView} from "../interfaces";

export function Theme(app: IJetApp, view: IJetView, config: any){
	let theme = config.theme || "webix:siberia";

	const service = {
		getTheme(){ return theme; },
		setTheme(name:string){
			// document.location.reload();
			theme = name;
		}
	};

	app.setService("theme", service);
	view.on(app, `user:settings`, function(settings: any){
		if (settings.theme && settings.theme !== theme){
			service.setTheme(settings.theme)
		}
	});
}
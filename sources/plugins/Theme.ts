import {IJetApp, IJetView, IWebixFacade} from "../interfaces";

export function Theme(app: IJetApp, _view: IJetView, config: any){
	config = config || {};
	const storage = config.storage;
	let theme = storage ?
		(storage.get("theme")||"material-default")
		:
		(config.theme || "material-default");

	const service = {
		getTheme(){ return theme; },
		setTheme(name:string, silent?:boolean){
			const parts = name.split("-");
			const links = document.getElementsByTagName("link");

			for (let i=0; i<links.length; i++){
				const lname = links[i].getAttribute("title");
				if (lname){
					if (lname === name || lname === parts[0]){
						links[i].disabled = false;
					} else {
						links[i].disabled = true;
					}
				}
			}

			(app.webix as any).skin.set(parts[0]);
			// remove old css
			app.webix.html.removeCss(document.body, "theme-"+theme);
			// add new css
			app.webix.html.addCss(document.body, "theme-"+name);

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
import {IJetApp, IJetURL, IJetView} from "../interfaces";

export function Theme(app: IJetApp, view: IJetView, config: any){
	config = config || {};
	const storage = config.storage;
	let theme = storage ? storage.get("theme") : (config.theme || "flat-default");

	const service = {
		getTheme(){ return theme; },
		setTheme(name:string, silent?:boolean){
			var parts = name.split("-");
			var links = document.getElementsByTagName("link");

			for (var i=0; i<links.length; i++){
				var lname = links[i].getAttribute("title");
				if (lname){
					if (lname === name || lname === parts[0]){
						links[i].disabled = false;
					} else {
						links[i].disabled = true;
					}
				}
			}

			(webix as any).skin.set(parts[0]);
			//remove old css
			webix.html.removeCss(document.body, "theme-"+theme);
			//add new css
			webix.html.addCss(document.body, "theme-"+name);

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
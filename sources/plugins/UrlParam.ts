import {IJetApp, IJetURL, IJetView, IRoute, IWebixFacade} from "../interfaces";

function copyParams(data: any, url:IJetURL, route:string[]){
	for (let i = 0; i < route.length; i++){
		data[route[i]] = url[i+1] ? url[i+1].page : "";
	}
}

export function UrlParam(app: IJetApp, view: IJetView, config: any){
	const route = config.route || config;
	const data = {};
	const seg = null;

	view.on(app, "app:urlchange", function(subview, segment:IRoute){
		if (view === subview){
			copyParams(data, segment.suburl(), route);
			segment.size(route.length+1);
		}
	});

	const os = view.setParam;
	const og = view.getParam;

	view.setParam = function(name, value, show){
		const index = route.indexOf(name);
		if (index >= 0){
			data[name] = value;
			this._segment.update("", value, index+1);
			if (show){
				return view.show("");
			}
		} else {
			return os.call(this, name, value, show);
		}
	};

	view.getParam = function(key, mode){
		const val = data[key];
		if (typeof val !== "undefined") { return val; }
		return og.call(this, key, mode);
	};

	copyParams(data, view.getUrl(), route);
}

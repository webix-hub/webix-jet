import {IJetApp, IJetView} from "../interfaces";
import Polyglot from "node-polyglot/build/polyglot";

declare function require(name:string):any;


function copyParams(view: IJetView, url, route){
	for (var i = 0; i < route.length; i++){
		view.setVar(route[i], url[i+1] ? url[i+1].page : "");
	}
	
}
export function UrlVar(app: IJetApp, view: IJetView, config: any){
	const route = config.route || config;
	view.on(app, "app:urlchange", function(subview, url){
		if (view === subview){
			copyParams(view, url, route);
			url.splice(1, route.length);
		}
	});
	copyParams(view, view.getUrl(), route);
}

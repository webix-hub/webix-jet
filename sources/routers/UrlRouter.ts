import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class UrlRouter implements IJetRouter{
	private cb: IJetRouterCallback;
	private prefix:string;

	constructor(cb: IJetRouterCallback, config:any){
		this.cb = cb;
		this.prefix = config.routerPrefix || "";
	}
	set(path:string, config?:IJetRouterOptions){
		window.history.pushState(null, null, this.prefix + path);
		if (!config || !config.silent){
			setTimeout(() => this.cb(path), 1);
		}
	}
	get(){
		const path = window.location.pathname.replace(this.prefix, "");
		return path !== "/" ? path : "";
	}
}
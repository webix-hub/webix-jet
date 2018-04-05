import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class UrlRouter implements IJetRouter{
	private cb: IJetRouterCallback;
	private prefix:string;
	constructor(cb: IJetRouterCallback, config:any){
		this.cb = cb;

		window.onpopstate = () => this.cb(this.get());
		this.prefix = config.routerPrefix || "";
	}
	set(path:string, config?:IJetRouterOptions){
		if (this.get() !== path){
			window.history.pushState(null, null, this.prefix + path);
		}
		if (!config || !config.silent){
			setTimeout(() => this.cb(path), 1);
		}
	}
	get():string{
		const path = window.location.pathname.replace(this.prefix, "");
		return path !== "/" ? path : "";
	}
}
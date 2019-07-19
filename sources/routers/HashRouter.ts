import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class HashRouter implements IJetRouter{
	protected config:any;
	protected prefix:string;
	protected sufix:string;
	private cb: IJetRouterCallback;

	constructor(cb: IJetRouterCallback, config:any){
		this.config = config || {};
		this._detectPrefix();
		this.cb = cb;
		window.onpopstate = () => this.cb(this.get());
	}

	set(path:string, config?:IJetRouterOptions){
		if (this.config.routes){
			const compare = path.split("?",2);
			for (const key in this.config.routes){
				if (this.config.routes[key] === compare[0]){
					path = key+(compare.length > 1 ? "?"+compare[1] : "");
					break;
				}
			}
		}

		if (this.get() !== path){
			window.history.pushState(null, null, this.prefix + this.sufix + path);
		}
		if (!config || !config.silent){
			setTimeout(() => this.cb(path), 1);
		}
	}
	get(){
		let path = this._getRaw().replace(this.prefix, "").replace(this.sufix, "");
		path = (path !== "/" && path !== "#") ? path : "";

		if (this.config.routes){
			const compare = path.split("?",2);
			const key = this.config.routes[compare[0]];
			if (key){
				path = key+(compare.length > 1 ? "?"+compare[1] : "");
			}
		}
		return path;
	}
	protected _detectPrefix(){
		// use "#!" for backward compatibility
		const sufix = this.config.routerPrefix;
		this.sufix = "#" + ((typeof sufix === "undefined") ? "!" : sufix);

		this.prefix = document.location.href.split("#", 2)[0];
	}

	protected _getRaw(){
		return document.location.href;
	}
}
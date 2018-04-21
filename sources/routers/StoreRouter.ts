import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class StoreRouter implements IJetRouter{
	private name:string;
	private cb: IJetRouterCallback;

	constructor(cb: IJetRouterCallback, config:any){
		this.name = (config.storeName || config.id+":route");
		this.cb = cb;
	}
	set(path:string, config?:IJetRouterOptions){
		webix.storage.session.put(this.name, path);
		if (!config || !config.silent){
			setTimeout(() => this.cb(path), 1);
		}
	}
	get(){
		return webix.storage.session.get(this.name);
	}
}
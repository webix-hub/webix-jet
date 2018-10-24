import {IJetApp, IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class StoreRouter implements IJetRouter{
	private name:string;
	private storage: any;
	private cb: IJetRouterCallback;

	constructor(cb: IJetRouterCallback, config:any, app: IJetApp){
		this.storage = config.storage || app.webix.storage.session;
		this.name = (config.storeName || config.id+":route");
		this.cb = cb;
	}
	set(path:string, config?:IJetRouterOptions){
		this.storage.put(this.name, path);
		if (!config || !config.silent){
			setTimeout(() => this.cb(path), 1);
		}
	}
	get(){
		return this.storage.get(this.name);
	}
}
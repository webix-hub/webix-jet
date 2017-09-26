import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class EmptyRouter implements IJetRouter{
	private path: string;
	private cb: IJetRouterCallback;

	constructor(cb: IJetRouterCallback, _$config:any){
		this.path = "";
		this.cb = cb;
	}
	set(path:string, config?:IJetRouterOptions){
		this.path = path;
		if (!config || !config.silent){
			setTimeout(() => this.cb(path), 1);
		}
	}
	get(){
		return this.path;
	}
}
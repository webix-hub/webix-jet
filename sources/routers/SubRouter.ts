import {IJetApp, IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

import {url2str} from "../helpers";

export class SubRouter implements IJetRouter{
	private app: IJetApp;
	private path: string;
	private prefix: string;

	constructor(cb: IJetRouterCallback, config:any, app:IJetApp){
		this.path = "";
		this.app = app;
	}
	set(path:string, config?:IJetRouterOptions){
		this.path = path;
		const a = this.app as any;
		a.app.getRouter().set(a._segment.append(this.path), { silent:true });
	}
	get(){
		return this.path;
	}
}
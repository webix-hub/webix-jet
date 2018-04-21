import routie from "webix-routie/lib/routie";

import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";



export class HashRouter implements IJetRouter{
	private config:any;
	private _lastUrl:string;
	private _prefix:string;

	constructor(cb: IJetRouterCallback, config:any){
		this.config = config || {};
		this._prefix = this.config.routerPrefix;

		// use "#!" for backward compatibility
		if (typeof this._prefix === "undefined"){
			this._prefix = "!";
		}

		let rcb = function(_$a){ /* stub */ };
		routie(this._prefix+"*", () => {
			this._lastUrl = "";
			return rcb(this.get());
		});
		rcb = cb;
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

		this._lastUrl = path;
		(routie as any).navigate(this._prefix+path, config);
	}
	get(){
		let path =  this._lastUrl ||
					(window.location.hash || "").replace("#"+this._prefix,"");

		if (this.config.routes){
			const compare = path.split("?",2);
			const key = this.config.routes[compare[0]];
			if (key){
				path = key+(compare.length > 1 ? "?"+compare[1] : "");
			}
		}
		return path;
	}
}
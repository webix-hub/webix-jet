import routie from "webix-routie/lib/routie";

import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";



export class HashRouter implements IJetRouter{
	private config:any;
	constructor(cb: IJetRouterCallback, config:any){
		this.config = config || {};

		let rcb = function(_$a){ /* stub */ };
		routie("!*", url => rcb(this.get()));
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

		(routie as any).navigate("!"+path, config);
	}
	get(){
		let path = (window.location.hash || "").replace("#!","");
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
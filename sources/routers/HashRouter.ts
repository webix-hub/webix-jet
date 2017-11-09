import routie from "webix-routie/lib/routie";

import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";



export class HashRouter implements IJetRouter{
	constructor(cb: IJetRouterCallback, _$config:any){
		let rcb = function(_$a){ /* stub */ };
		routie("!*", function(a){ return rcb(a); });
		rcb = cb;
	}
	set(path:string, config?:IJetRouterOptions){
		(<any>routie).navigate("!"+path, config);
	}
	get(){
		return (window.location.hash || "").replace("#!","");
	}
}
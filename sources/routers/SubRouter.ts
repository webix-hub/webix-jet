import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";

export class SubRouter implements IJetRouter{
	private path: string;
	private parent: IJetRouter;
	private prefix: string;

	constructor(cb: IJetRouterCallback, config:any){
		this.path = "";
		this.parent = config.parentRouter;
		this.prefix = config.routerPrefix || "";
	}
	set(path:string, config?:IJetRouterOptions){
		//get path till current router
		//it depends on uniquiness of module name, which can't be guaranteed
		let fullpath = this.parent.get();
		const start = fullpath.indexOf(this.prefix);
		if (start != -1){
			fullpath = fullpath.substr(0, start + this.prefix.length);
		}

		//remove module name from app's path
		this.path = path.replace(this.prefix, "");
		//set new full path to the parent router
		this.parent.set(fullpath + this.path, config);
	}
	get(){
		return this.path;
	}
}
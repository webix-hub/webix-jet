import {IJetRouter, IJetRouterCallback, IJetRouterOptions} from "../interfaces";
import { HashRouter } from "./HashRouter";

export class UrlRouter extends HashRouter implements IJetRouter{
	protected _detectPrefix(){
		this.prefix = "";
		this.sufix = this.config.routerPrefix || "";
	}
	protected _getRaw(){
		return document.location.pathname + (document.location.search||"");
	}
}
import { IJetApp } from "./interfaces";
import { JetAppBase } from "./JetAppBase";
import { HashRouter } from "./routers/HashRouter";

import patch from "./patch";

// webpack require
declare function require(_$url: string): any;

// webpack require
declare function require(_$url: string): any;

export class JetApp extends JetAppBase implements IJetApp {
	constructor(config: any) {
		config.router = config.router || HashRouter;
		super(config);
		patch(this.webix);
	}
	_loadViewDynamic(url){
		url = url.replace(/\./g, "/");
		return require("jet-views/"+url);
	}
}

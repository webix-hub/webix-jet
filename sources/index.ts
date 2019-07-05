/*
MIT License
Copyright (c) 2019 XB Software
*/

import { IJetApp, IJetView } from "./interfaces";
export { IJetApp, IJetView };

import {NavigationBlocked} from "./errors";

export { JetApp } 		from "./JetApp";
export { JetView } 		from "./JetView";

export { HashRouter } 	from "./routers/HashRouter";
export { StoreRouter }	from "./routers/StoreRouter";
export { UrlRouter } 	from "./routers/UrlRouter";
export { EmptyRouter } 	from "./routers/EmptyRouter";
export { SubRouter } 	from "./routers/SubRouter";

import {UnloadGuard} 	from "./plugins/Guard";
import {Locale} 		from "./plugins/Locale";
import {Menu} 			from "./plugins/Menu";
import {Status} 		from "./plugins/Status";
import {Theme} 			from "./plugins/Theme";
import {UrlParam}		from "./plugins/UrlParam";
import {User} 			from "./plugins/User";

import patch from "./patch";
let webix = (window as any).webix;
if (webix){
	patch(webix);
}

export const plugins = {
	UnloadGuard, Locale, Menu, Theme, User, Status, UrlParam
};

export const errors = { NavigationBlocked };

const w = window as any;
if (!w.Promise){
	w.Promise = w.webix.promise;
}
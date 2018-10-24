/*
MIT License
Copyright (c) 2018 XB Software
*/

import { IJetApp, IJetView } from "./interfaces";
export { IJetApp, IJetView };

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

export const plugins = {
	UnloadGuard, Locale, Menu, Theme, User, Status, UrlParam
};

if (!(window as any).Promise){
	(window as any).Promise = webix.promise;
}
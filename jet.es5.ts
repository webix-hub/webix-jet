import * as lib from "./sources/index";

(window as any).JetApp   = lib.JetApp;
(window as any).JetView  = lib.JetView;


(window as any).JetApp.plugins = lib.plugins;

(window as any).JetApp.routers = {
	EmptyRouter : lib.EmptyRouter,
	HashRouter  : lib.HashRouter,
	StoreRouter : lib.StoreRouter,
	UrlRouter   : lib.UrlRouter
};

if (!(window as any).Promise){
	(window as any).Promise = webix.promise;
}
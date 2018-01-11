import { IJetApp, IJetView } from "./interfaces";
export { JetApp } from "./JetApp";
export { JetView } from "./JetView";
export { HashRouter } from "./routers/HashRouter";
export { StoreRouter } from "./routers/StoreRouter";
export { UrlRouter } from "./routers/UrlRouter";
export { EmptyRouter } from "./routers/EmptyRouter";
export declare const plugins: {
    UnloadGuard: (app: IJetApp, view: IJetView, config: any) => void;
    Locale: (app: IJetApp, view: IJetView, config: any) => void;
    Menu: (app: IJetApp, view: IJetView, config: any) => void;
    Theme: (app: IJetApp, view: IJetView, config: any) => void;
    User: (app: IJetApp, view: IJetView, config: any) => void;
    Status: (app: IJetApp, view: IJetView, config: any) => void;
    UrlParam: (app: IJetApp, view: IJetView, config: any) => void;
};

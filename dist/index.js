import { JetApp } from "./JetApp";
import { JetView } from "./JetView";
export { JetApp, JetView };
export { HashRouter } from "./routers/HashRouter";
export { StoreRouter } from "./routers/StoreRouter";
export { UrlRouter } from "./routers/UrlRouter";
export { EmptyRouter } from "./routers/EmptyRouter";
import { UnloadGuard } from "./plugins/Guard";
import { Locale } from "./plugins/Locale";
import { Menu } from "./plugins/Menu";
import { Status } from "./plugins/Status";
import { Theme } from "./plugins/Theme";
import { UrlParam } from "./plugins/UrlParam";
import { User } from "./plugins/User";
export var plugins = {
    UnloadGuard: UnloadGuard, Locale: Locale, Menu: Menu, Theme: Theme, User: User, Status: Status, UrlParam: UrlParam
};
var w = window;
if (!w.Promise) {
    w.Promise = webix.promise;
}
if (w.webix) {
    w.webix.jet = {
        JetApp: JetApp, JetView: JetView
    };
}

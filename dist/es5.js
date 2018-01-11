import * as jet from "./index";
var w = window;
if (!w.webix) {
    w.webix = {};
}
w.webix.jet = {};
webix.extend(w.webix.jet, jet, true);

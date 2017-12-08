import * as jet from "./index";

const w = window as any;
if (!w.webix){
	w.webix = {};
}

w.webix.jet = {};
Object.assign(w.webix.jet, jet);


/*
MIT License
Copyright (c) 2019 XB Software
*/

import * as jet from "./index";

const w = window as any;
if (!w.webix){
	w.webix = {};
}

w.webix.jet = {};
w.webix.extend(w.webix.jet, jet, true);


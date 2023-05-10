import { patch, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { SubApp } from "./stubs/views";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});



it("can use inner navigation", async () => {
    patch(webix);

    webix.protoUI({
        name:"subapp",
        app: SubApp
    }, webix.ui.jetapp);

    const ui = webix.ui({ view:"subapp", id:"d1",  router: EmptyRouter });
    await(ui.$app.ready);
    const topView = ui.$app.getSubView();
    await ui.$app.show("body2");

    expect(ui.$app.getUrlString()).to.eq("body2");
    expect(!!topView.getSubView()).to.eq(false);

    ui.destructor();
});

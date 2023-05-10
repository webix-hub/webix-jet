import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { TopMenuView, MenuView, SubMenuView } from "./stubs/views";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});



it("must mark page on url change", async () => {
    app = new JetApp({
        router: EmptyRouter,
        start:"/some/two",
        debug: true,
        views:{
            "some": MenuView,
            "one":{  },
            "two":{  },
            "three": {  }
        }
    });

    await app.render(document.body);
    expect(webix.$$("s1").getValue()).to.equal("two");

    await app.show("/some/one");
    expect(webix.$$("s1").getValue()).to.equal("one");

    await app.show("/some/two");
    expect(webix.$$("s1").getValue()).to.equal("two");

    await app.show("/some/three");
    expect(webix.$$("s1").getValue()).to.equal("three");

    await app.show("/some");
});

it("must work from sub-views", async () => {
    app = new JetApp({
        router: EmptyRouter,
        start:"/some/two",
        debug: true,
        views:{
            "some": TopMenuView,
            "submenu" : SubMenuView,
            "one":{  },
            "two":{  },
            "three": {  }
        }
    });

    await app.render(document.body);
    expect(webix.$$("s1").getValue()).to.equal("two");

    await app.show("/some/one");
    expect(webix.$$("s1").getValue()).to.equal("one");

    await app.show("/some/two");
    expect(webix.$$("s1").getValue()).to.equal("two");

    await app.show("/some/three");
    expect(webix.$$("s1").getValue()).to.equal("three");
    
});

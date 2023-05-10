import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { UrlParamsView } from "./stubs/views";
import { errors } from "../sources/index";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});


beforeEach(function(){
    app = new JetApp({
        router: EmptyRouter,
        start:"/some/url/here",
        debug: false,
        views:{
            "some":{ rows:[{ $subview:true }] },
            "url":{ rows:[{ $subview:true }] },
            "here":{ template:() => app.config.counter, localId:"h1" },
            "there":{ template:"s2", localId:"t1" }
        }
    });
    return app.render(document.body)
});


it("app:guard", async () => {
    let counter = 0;
    app.on("app:guard", () => counter++)
    await app.show("/some/url/there");
    expect(counter).to.equal(1);
});

it("app:guard", async () => {
    app.on("app:guard", () => false )
    let error = null;

    await (app.show("/some/url/there").catch(e => {
        error = e;
    }));

    expect(error).instanceof(errors.NavigationBlocked);
});

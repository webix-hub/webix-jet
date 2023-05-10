import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { UrlParamsView } from "./stubs/views";

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
        start:"/some",
        debug: true,
        views:{
            "some":{ rows:[{ $subview:true }] },
            "url":{ rows:[{ $subview:true }] },
            "here":{ template:"s1", localId:"h1" },
            "params": UrlParamsView
        }
    });
    return app.render(document.body)
})

it("must parse params from the url", async () => {
    await app.show("/some/params")
    expect(app.getUrlString()).to.equal("some/params");

    const params = app.getSubView().getSubView();

    await app.show("/some/params/one/12")
    expect( params.getParam("mode") ).to.equal("one");
    expect( params.getParam("id") ).to.equal("12");

    await app.show("/some/params/two/14")
    expect( params.getParam("mode") ).to.equal("two");
    expect( params.getParam("id") ).to.equal("14");

    expect(app.getUrlString()).to.equal("some/params/two/14");
    expect(params.getUrlString()).to.equal("params/two/14");
});

it("must parse params on navigation", async () => {
    await app.show("/some/params/two/14")
    expect(app.getUrlString()).to.equal("some/params/two/14");

    const params = app.getSubView().getSubView();
    await params.setParam("id", 12, true);
    expect(params.getUrlString()).to.equal("params/two/12");

    await params.show({ id : 11 });
    expect(params.getUrlString()).to.equal("params/two/11");
    expect(params.getParam("id")+"").to.equal("11")

    await params.show("../params/two/10");
    expect(params.getUrlString()).to.equal("params/two/10");
    expect(params.getParam("id")+"").to.equal("10")

    await params.show("here");
    expect(params.getUrlString()).to.equal("params/two/10/here");
    expect(params.getParam("id")+"").to.equal("10")

    await params.show("some");
    expect(params.getUrlString()).to.equal("params/two/10/some");
    expect(params.getParam("id")+"").to.equal("10")
});

it("must preserve params on refresh", async () => {
    await app.show("/some/params/two/14")
    expect(app.getUrlString()).to.equal("some/params/two/14");

    await app.refresh();
    expect(app.getUrlString()).to.equal("some/params/two/14");

    const params = app.getSubView().getSubView();
    await params.refresh();
    expect(params.getUrlString()).to.equal("params/two/14");
    expect(app.getUrlString()).to.equal("some/params/two/14");
});

it("must correctly process force-show flag", async () => {
    await app.show("/some/params/two/14")
    expect(app.getUrlString()).to.equal("some/params/two/14");

    await app.getSubView().getSubView().setParam("mode", "five", true);
    expect(app.getUrlString()).to.equal("some/params/five/14");
});

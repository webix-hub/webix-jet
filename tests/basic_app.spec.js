import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { ChangeRouteFromInit, ChangeRouteFromUrlChange } from "./stubs/views";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});

let guard_counter=0;

beforeEach(async () => {
	app = new JetApp({
		start:"/Demo/Details", router: EmptyRouter,
		debug: true,
		version: 2,
		views:{
			"Demo":{ rows:[{ $subview:true }] },
			"Details":{ template:"App" },
			"Other":new Promise(r => r({ template:"Other" })),
			"Change1":ChangeRouteFromInit,
			"Change2":ChangeRouteFromUrlChange
		}
	});
	app.attachEvent("app:guard", () => ++guard_counter );
	await app.render(document.body);
})

it("can init", () => {
	// initialized
	expect(app).be.instanceOf(JetApp);
	// config set
	expect(app.config.version).eq(2);
	// guard event triggered
	expect(guard_counter).eq(1);

	// default route applied
	expect(app.getRouter().get()).eq("/Demo/Details");
	expect(app.getRoot().name).eq("layout")
	expect(app.getRoot().getChildViews()[0].name).eq("template")
});

it("can set empty url", async () => {
	guard_counter = 0;
	expect(app.getUrlString()).to.eq("Demo/Details");

	await app.show("/Demo/Other")
	expect(app.getUrlString()).to.eq("Demo/Other");
	expect(guard_counter).eq(1);

	await app.show("")
	expect(app.getUrlString()).to.eq("Demo/Details");
	expect(guard_counter).eq(2);
});

it("can change ulr from handler", async () => {
	guard_counter = 0;
	await app.show("Demo/Change1/Details")
	expect(app.getUrlString()).to.eq("Demo/Change1/Other");
	expect(guard_counter).eq(2);

	await app.show("Demo/Change2/Details")
	expect(app.getUrlString()).to.eq("Demo/Other");
	expect(guard_counter).eq(4);

	const a1 = app.show("Demo/Other")
	const a2 = app.show("Demo/Details")
	await Promise.all([a1, a2])
	expect(app.getUrlString()).to.eq("Demo/Details");
	expect(guard_counter).eq(6);
});
import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { getEvents, resetEvents, TopView, SubView1, SubView2 } from "./stubs/views";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});

it("process init, config, ready, destroy in the correct order", () => {
	resetEvents();
	
	app = new JetApp({
		start:"/Top/Sub1", router: EmptyRouter,
		debug: true,
		version: 2,
		views:{
			"Top":TopView,
			"Sub1":SubView1,
			"Sub2":SubView2
		}
	});

	return app.render(document.body).then( _ => {
		expect(getEvents(), "after init").deep.equal([
			"top-config", "top-init",
			"sub1-config", "sub1-init", "sub1-urlChange", "sub1-ready",
			"top-urlChange", "top-ready"]);
		
		resetEvents();
		return app.show("Top/Sub2");
	}).then(_ => {
		expect(getEvents(), "after show").deep.equal([ 
			"sub2-config", 
			"sub1-destroy", 
			"sub2-init", "sub2-urlChange", "sub2-ready",
			"top-urlChange"
		]);

		resetEvents();
		return app.refresh();
	}).then(_ => {
		expect(getEvents(), "after refresh").deep.equal([
			"top-destroy", "sub2-destroy",
			"top-config", "top-init",
			"sub2-config", "sub2-init", "sub2-urlChange", "sub2-ready",
			"top-urlChange", "top-ready"]);

		resetEvents();
		return app.destructor();
	}).then(_ => {
		expect(getEvents()).deep.equal([ "top-destroy", "sub2-destroy"]);
	}).catch(err => {
		resetEvents();

		app.destructor();
		throw err;
	});
});

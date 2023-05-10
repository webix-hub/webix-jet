import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, it, expect } from "vitest";

import { waitTime, loadWebix } from "./stubs/helpers";
import { TopView, SubView1, SubView2, getEvents, resetEvents } from "./stubs/views";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});

it("create/destory views on addView / removeView calls", async () => {
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

	let view = new SubView2(app, "");

	await app.render(document.body);

	resetEvents();
	app.getRoot().addView(view);

	await waitTime(20);	//addView doesn't return promise, so need to wait

	expect(getEvents(), "after addView").deep.equal([ 
		"sub2-config", "sub2-init", "sub2-urlChange", "sub2-ready"
	]);
	expect(app.getSubView().contains(view)).to.be.true

	resetEvents();
	view.getRoot().getParentView().removeView(view.getRoot());

	await waitTime(20);

	expect(getEvents(), "after removeView").deep.equal(["sub2-destroy"]);
	expect(app.getSubView().contains(view)).to.be.false
});
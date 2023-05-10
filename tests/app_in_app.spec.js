import { JetApp, EmptyRouter } from "../sources/index";
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


const href = () => document.location.href.split("#")[1].slice(1);
const baseUrl = document.location.href;
beforeEach(function(){
	app = new JetApp({
		start:"/Demo/SubApp",
		debug: true,
		version: 2,
		views:{
			"Demo":{ rows:[{ $subview:true }] },
			"Details":{ template:"App" },
			"SubApp" : SubApp
		}
	});
	return app.render(document.body, "Demo/SubApp");
});

afterEach(function(){
	window.history.pushState(null, null, baseUrl);
});

it("can navigate", async () => {
	expect(app.getUrlString()).to.equal("Demo/SubApp/top/body");
	expect(href()).to.equal("/Demo/SubApp/top/body");

	await $$("sb-tp").$scope.show("body2");
	expect(app.getUrlString()).to.equal("Demo/SubApp/top/body2");
	expect(href()).to.equal("/Demo/SubApp/top/body2");
	
	await app.show("/Demo/Details");
	expect(app.getUrlString()).to.equal("Demo/Details");
	expect(href()).to.equal("/Demo/Details");

	await app.show("/Demo/SubApp/top");
	expect(app.getUrlString()).to.equal("Demo/SubApp/top");
	expect(href()).to.equal("/Demo/SubApp/top");

	await app.show("/Demo/SubApp/body");
	expect(app.getUrlString()).to.equal("Demo/SubApp/body");
	expect(href()).to.equal("/Demo/SubApp/body");
});

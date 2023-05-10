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

function filterUrl(url){
	const data = url.slice(0);
	for (var i=0; i<data.length; i++){
		data[i] = { page: data[i].page, params: data[i].params };
	}
	return data;
}

beforeEach(function(){
	app = new JetApp({
		router: EmptyRouter,
		start:"/there",
		debug: true,
		views:{
			"some":{ rows:[{ $subview:true }] },
			"url":{ rows:[{ $subview:true }] },
			"here":{ template:"s1", localId:"h1" },
			"there":{ template:"s2", localId:"t1" }
		}
	});
	return app.render(document.body)
});

it("must split url in chunks", () => {
	return app.show("/some/url/here")
	.then(_ =>{
		expect(filterUrl(app.getSubView().getUrl())).to.deep.equal([
			{ page:"some",	params:{} },
			{ page:"url",	params:{} },
			{ page:"here",	params:{} }
		]);
	});
});

it("must work without leading /", () => {
	return app.show("some/url/here")
	.then(_ =>{
		expect(filterUrl(app.getSubView().getUrl())).to.deep.equal([
			{ page:"some",	params:{} },
			{ page:"url",	params:{} },
			{ page:"here",	params:{} }
		]);
	});		
});

it("must parse url parameters", () => {
	return app.show("/some:test1=1:test2=2/url?test3=3&test4=4/here")
	.then(_ =>{
		expect(filterUrl(app.getSubView().getUrl())).to.deep.equal([
			{ page:"some",	params:{ test1: "1", test2 : "2" } },
			{ page:"url",	params:{ test3: "3", test4 : "4" } },
			{ page:"here",	params:{} }
		]);
	});	
});


it("must merge parameters from string", async () => {
	await app.show("some/url/here");
	var hereView = app.getRoot().queryView({ localId: "h1"}).$scope;
	await hereView.show("there?id=123&t=245");
	
	var thereView = app.getRoot().queryView({ localId: "t1"}).$scope;
	expect(filterUrl(thereView.getUrl())).to.deep.equal([{
		page:"there",	params:{ id:"123", t:"245" } 
	}]);
	expect(thereView.getUrlString()).eq("there?id=123&t=245");

	expect(filterUrl(thereView.getParentView().getUrl())).to.deep.equal([
		{ page:"url",	params:{} },
		{ page:"there",	params:{ id:"123", t:"245" } }
	]);
	expect(thereView.getParentView().getUrlString()).eq("url/there?id=123&t=245");

	expect(filterUrl(app.getSubView().getUrl())).to.deep.equal([
		{ page:"some",	params:{} },
		{ page:"url",	params:{} },
		{ page:"there",	params:{ id:"123", t:"245" } }
	]);
	expect(app.getSubView().getUrlString()).eq("some/url/there?id=123&t=245");

	expect(filterUrl(app.getUrl())).to.deep.equal([
		{ page:"some",	params:{} },
		{ page:"url",	params:{} },
		{ page:"there",	params:{ id:"123", t:"245" } }
	]);
	expect(app.getUrlString()).eq("some/url/there?id=123&t=245");
});

it("must merge parameters from object", async () => {
	await app.show("some/url/there")
	
	var hereView = app.getRoot().queryView({ localId: "t1"}).$scope;
	expect(hereView.getParam("t")).eq(undefined);
	await hereView.show({ id:123, t:245 });
	
	var thereView = app.getRoot().queryView({ localId: "t1"}).$scope;
	expect(thereView.getUrlString()).eq("there?id=123&t=245");
	expect(app.getUrlString()).eq("some/url/there?id=123&t=245");

	expect(thereView.getParam("t")).eq(245);
	thereView.setParam("t", "246");
	expect(thereView.getParam("t")).eq("246");
	await thereView.setParam("z", 3, true);
	

	var thereView = app.getRoot().queryView({ localId: "t1"}).$scope;
	expect(thereView.getUrlString()).eq("there?id=123&t=246&z=3");
});

it("must understand jet 0.x parameters syntax", () => {
	return app.show("/some?test1=1&test2=2/url?test3=3&test4=4/here")
	.then(_ => {
		const url = app.getUrl();
		expect(url[0].params).deep.eq({test1:"1", test2:"2"});
		expect(url[1].params).deep.eq({test3:"3", test4:"4"});

		return app.show("/some:test1=1:test2=2/url:test3=3:test4=4/here");
	})
	.then(_ =>{
		const url = app.getUrl();

		expect(url[0].params).deep.eq({test1:"1", test2:"2"});
		expect(url[1].params).deep.eq({test3:"3", test4:"4"});
	});
});

it("must work with different navigation patterns", async () => {
	await app.show("some/url/there")
	
	var view = app.getRoot().queryView({ localId: "t1"}).$scope;
	await view.show("here");
	expect(app.getUrlString(),"{name}").eq("some/url/here");

	var view = app.getRoot().queryView({ localId: "h1"}).$scope;
	await view.show("./there");
	expect(app.getUrlString(),"./{name}").eq("some/url/there");

	var view = app.getRoot().queryView({ localId: "t1"}).$scope;
	await view.show("../../here");
	expect(app.getUrlString(),"../{name}").eq("some/here");

	var view = app.getRoot().queryView({ localId: "h1"}).$scope;
	await view.show("/some/url/there");
	expect(app.getUrlString(),"/{name}").eq("some/url/there");

	await app.show("/some/url/here");
	expect(app.getUrlString(),"/{name}").eq("some/url/here");
});

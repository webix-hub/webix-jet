var expect = require("chai").expect;

const ui = require("../sources/url.js");


describe("url", ()=>{

	describe("parse", () => {

		it("must split url in chunks", () => {
			var stack = ui.parse("/some/url/here");
			expect(stack).to.deep.equal([
				{ page:"some",	params:{} },
				{ page:"url",	params:{} },
				{ page:"here",	params:{} }
			]);			
		});

		it("must work without leading /", () => {
			var stack = ui.parse("some/url/here");
			expect(stack).to.deep.equal([
				{ page:"some",	params:{} },
				{ page:"url",	params:{} },
				{ page:"here",	params:{} }
			]);			
		});

		it("must parse url parameters", () => {
			var stack = ui.parse("/some:test1=1:test2=2/url?test3=3&test4=4/here");
			expect(stack).to.deep.equal([
				{ page:"some",	params:{ test1: "1", test2 : "2" }},
				{ page:"url",	params:{ test3: "3", test4 : "4" }},
				{ page:"here",	params:{} }
			]);			
		});
	});
	
	describe("url2str", () => {

		it("must convert stack back to str", () => {
			var url = "/some/url/here";
			var stack = ui.parse(url);
			expect( ui.url2str(stack) ).to.equal(url);
		});

		it("must convert stack parameters back to str", () => {
			var url = "/some:test1=1:test2=2/url:test3=3:test4=4/here";
			var stack = ui.parse(url);
			expect( ui.url2str(stack) ).to.equal(url);
		});
	});
});
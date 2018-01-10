import {expect} from "chai";
import {parse,url2str} from "../sources/helpers";

describe("URL", ()=>{

	describe("parse", () => {

		it("must split url in chunks", () => {
			const stack = parse("/some/url/here");
			expect(stack).to.deep.equal([
				{ page:"some",	params:{}, index:1 },
				{ page:"url",	params:{}, index:2 },
				{ page:"here",	params:{}, index:3 }
			]);			
		});

		it("must work without leading /", () => {
			const stack = parse("some/url/here");
			expect(stack).to.deep.equal([
				{ page:"some",	params:{}, index:1 },
				{ page:"url",	params:{}, index:2 },
				{ page:"here",	params:{}, index:3 }
			]);			
		});

		it("must parse url parameters", () => {
			const stack = parse("/some:test1=1:test2=2/url?test3=3&test4=4/here");
			expect(stack).to.deep.equal([
				{ page:"some",	params:{ test1: "1", test2 : "2" }, index:1 },
				{ page:"url",	params:{ test3: "3", test4 : "4" }, index:2 },
				{ page:"here",	params:{}, index:3 }
			]);			
		});
	});
	
	describe("url2str", () => {

		it("must convert stack back to str", () => {
			const url = "/some/url/here";
			const stack = parse(url);
			expect( url2str(stack) ).to.equal(url);
		});

		it("must convert stack parameters back to str", () => {
			const urlOld = "/some:test1=1:test2=2/url:test3=3:test4=4/here";
			const urlNew = "/some?test1=1&test2=2/url?test3=3&test4=4/here";
			expect( url2str(parse(urlOld)) ).to.equal(urlNew);
			expect( url2str(parse(urlNew)) ).to.equal(urlNew);
		});
	});
});
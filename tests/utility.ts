var expect = require("chai").expect;

const ui = require("../sources/utility.js");
function getInitMock(){
	return {
		_init:[], _destroy:[], _events:[], _windows:[], _subs:[]
	};
}

describe("copy", () => {

	it("must copy a simple object", () => {
		let source = { a:1, b:"2", c:[ 1, { obj: 2 } ] };
		let copy = ui.copy(source);
		expect(copy).to.not.equal(source);
		expect(copy).to.deep.equal(source);
	});

	it("must extend object, if provided", () => {
		let source = { a:1 };
		let copy = ui.copy(source, { d: 1 });
		expect(copy).to.not.equal(source);
		expect(copy).to.deep.equal({ a:1, d:1 });
	});

	it("must return only $ui part if available", () => {
		let source = { a:1, $ui:{ b: 1 } };
		let copy = ui.copy(source);
		expect(copy).to.not.equal(source);
		expect(copy).to.deep.equal(source.$ui);
	});

	it("must collapse nested $ui sections", () => {
		let source = { a:1, $ui:{ b: 1, c:{ $ui: { b: 3 } } } };
		let copy = ui.copy(source);
		expect(copy).to.not.equal(source);
		expect(copy).to.deep.equal({ b:1, c:{ b: 3 } });
	});

	it("must copy Date objects", () => {
		var date = new Date();
		let source = { a:date };
		let copy = ui.copy(source);

		expect(copy).to.not.equal(source);
		expect(copy.a).to.not.equal(date);
		expect(copy.a.valueOf()).to.equal(date.valueOf());
	});

	it("must collect $oninit handlers", () => {
		let source = { a: { $oninit:1 }, $oninit:2 };
		let config = getInitMock();
		ui.copy(source, null, config);

		expect(config._init).to.deep.equal([2,1]);
	});

	it("must collect $oninit handlers", () => {
		let source = { a: { $oninit:1 }, $oninit:2 };
		let config = getInitMock();
		ui.copy(source, null, config);

		expect(config._init).to.deep.equal([2,1]);
	});

	it("must collect $ondestroy handlers", () => {
		let source = { a: { $ondestroy:1 }, $ondestroy:2 };
		let config = getInitMock();
		ui.copy(source, null, config);

		expect(config._destroy).to.deep.equal([2,1]);
	});

	it("must collect $onevent", () => {
		let source = { a: { $onevent:{ a:1, b:2 }} , $onevent:{ c:3 } };
		let config = getInitMock();
		ui.copy(source, null, config);

		expect(config._events).to.deep.equal([{id:"c", handler:3},{id:"a", handler:1},{id:"b", handler:2}]);
	});

	it("must collect $windows", () => {
		let source = { a: { $windows:[1,2] }, $windows:[3,4,5] };
		let config = getInitMock();
		ui.copy(source, null, config);

		expect(config._windows).to.deep.equal([3,4,5,1,2]);
	});

	it("must collect a single $subview", () => {
		let source = { row: [{}, { $subview:true }, {}] };
		let config = getInitMock();
		let copy = ui.copy(source, null, config);

		expect(config._subs["default"]).to.exist;
		expect(config._subs["default"]).to.be.equal(copy.row[1].id);
	});

	it("must collect named $subview", () => {
		let source = { row: [{}, { $subview:"one" }, { $subview:"two" }] };
		let config = getInitMock();
		let copy = ui.copy(source, null, config);

		expect(config._subs["one"]).to.exist;
		expect(config._subs["two"]).to.exist;
		expect(config._subs["one"]).to.be.equal(copy.row[1].id);
		expect(config._subs["two"]).to.be.equal(copy.row[2].id);
	});

});
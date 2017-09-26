var expect = require("chai").expect;

const ui = require("../sources/plugins.js");


describe("JetPluginBox", () => {

	it("allows to create a plugin box", () => {
		var t = new ui.JetPluginBox();
		expect(t).to.be.instanceOf(ui.JetPluginBox);
	});
	it("allows to add and run handlers", () => {
		var t = new ui.JetPluginBox();

		var count = 0;
		t.add(function(ui, name, stack, scope){
			expect(ui).to.equal(1);
			expect(name).to.equal(2);
			expect(stack).to.equal(3);
			expect(scope).to.equal(4);
			count++;
		});
		t.add(function(ui, name, stack, scope){
			expect(ui).to.equal(1);
			expect(name).to.equal(2);
			expect(stack).to.equal(3);
			expect(scope).to.equal(4);
			count++;
		});
		var res = t.run(1,2,3,4);

		expect(res).to.equal(true);
		expect(count).to.equal(2);
	});
	it("allows to block execution", () => {
		var t = new ui.JetPluginBox();

		var count = 0;
		t.add(function(){
			count++;
			return false;
		});
		t.add(function(){
			count++;
		});
		var res = t.run(1,2,3,4);

		expect(res).to.equal(false);
		expect(count).to.equal(1);
	});
});
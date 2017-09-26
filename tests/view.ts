import {expect} from "chai";

import {IJetApp, IJetURLChunk, IJetView} from "../sources/interfaces";
import {JetView} from "../sources/JetView";
import {JetApp} from "../sources/JetApp";

class JetViewStart extends JetView {
	config(){
		return { template:"Start" };
	}
}

var urlPart:IJetURLChunk = { page:"Demo", params:{}, index:0 };

var app = new JetApp({})

describe("JetView", () => {

	describe("base API", () => {
		it("allows to create a JetView based class", () => {
			var t1 = new JetViewStart(app, "a1");

			expect(t1).to.be.instanceOf(JetView);
			expect(t1.app).to.equal(app);
		});
	});

	describe("UI life-cycle", () => {
		it("allows to create UI", () => {
			var t1 = new JetViewStart(app, "a1");
			t1.render("test", [urlPart]);
			//expect(app._ui).to.deep.equal([{config: { template:"header" }, cont:"test"}])
		});
		it("allows to destroy UI", () => {
			
		});
		it("allows to navigate UI", () => {
			
		});
		it("triggers all necessary handlers", () => {

		});
	});

	describe("Memory cleaning", () => {
		it("allows to attach temporary events", () => {
			
		});
		it("allows to create temporary UI", () => {
			
		});
	});
});
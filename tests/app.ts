import {expect} from "chai";

import {IJetApp, IJetURLChunk, IJetView, IWebixFacade} from "../sources/interfaces";
import {JetApp} from "../sources/JetApp";

describe("JetApp", () => {

	it("allows to create a JetApp", () => {
		var t1 = new JetApp({ });
		expect(t1).to.be.instanceOf(JetApp);
		expect(t1.config).to.exist;
    });

    it("allows to define and read config", () => {
		var t2 = new JetApp({ version: 2 });
		expect(t2).to.be.instanceOf(JetApp);
		expect(t2.config.version).to.equal(2);
	});

	it("can init start route", () => {
		var app = new JetApp({
			start:"/Demo/Details",
			views:{
				"Details":{ template:"App" }
			}
		});
	});

});
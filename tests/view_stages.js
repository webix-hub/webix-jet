var app;

describe("JetApp", () => {
	it("process init, config, ready, destroy in the correct order", () => {
        let events = [];
        class TopView extends jet.JetView {
			init(){
				events.push("top-init");
			}
            config(){
                events.push("top-config");
                return { rows:[ {$subview:true} ] };
			}
			ready(){
				events.push("top-ready");
			}
			destroy(){
				events.push("top-destroy");
			}
        }

        class SubView1 extends jet.JetView {
			init(){
				events.push("sub1-init");
			}
            config(){
                events.push("sub1-config");
                return { template:"a" };
			}
			ready(){
				events.push("sub1-ready");
			}
			destroy(){
				events.push("sub1-destroy");
			}
		}
		
        class SubView2 extends jet.JetView {
			init(){
				events.push("sub2-init");
			}
            config(){
                events.push("sub2-config");
                return { template:"a" };
			}
			ready(){
				events.push("sub2-ready");
			}
			destroy(){
				events.push("sub2-destroy");
			}
        }

		app = new jet.JetApp({
			start:"/Top/Sub1", router: jet.EmptyRouter,
			debug: true,
			version: 2,
			views:{
				"Top":TopView,
				"Sub1":SubView1,
				"Sub2":SubView2
			}
		});

		return app.render("sandbox").then( _ => {
			expect(events).deep.equal([ "top-config", "top-init", "sub1-config", "sub1-init", "sub1-ready", "top-ready"]);
			
			events = [];
			return app.show("Top/Sub2");
		}).then(_ => {
			expect(events).deep.equal([ "sub2-config", "sub1-destroy", "sub2-init", "sub2-ready" ]);

			events = [];
			return app.refresh();
		}).then(_ => {
			expect(events).deep.equal([ "top-config", "top-init", "sub2-config", "sub2-init", "sub2-ready", "top-ready"]);

			events = [];
			return app.destructor();
		}).then(_ => {
			expect(events).deep.equal([ "top-destroy", "sub2-destroy"]);
		}).catch(err => {
			app.destructor();
			throw err;
		});
	});

});
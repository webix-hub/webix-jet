describe("JetApp", () => {
	var app;

	it("process init, config, ready, destroy in the correct order", () => {
        events = [];
       
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
			expect(events, "after init").deep.equal([
				"top-config", "top-init",
				"sub1-config", "sub1-init", "sub1-urlChange", "sub1-ready",
				"top-urlChange", "top-ready"]);
			
			events = [];
			return app.show("Top/Sub2");
		}).then(_ => {
			expect(events, "after show").deep.equal([ 
				"sub2-config", 
				"sub1-destroy", 
				"sub2-init", "sub2-urlChange", "sub2-ready",
				"top-urlChange"
			]);

			events = [];
			return app.refresh();
		}).then(_ => {
			expect(events, "after refresh").deep.equal([
				"top-destroy", "sub2-destroy",
				"top-config", "top-init",
				"sub2-config", "sub2-init", "sub2-urlChange", "sub2-ready",
				"top-urlChange", "top-ready"]);

			events = [];
			return app.destructor();
		}).then(_ => {
			expect(events).deep.equal([ "top-destroy", "sub2-destroy"]);
		}).catch(err => {
			events = [];

			app.destructor();
			throw err;
		});
	});
});
var app;

describe("JetApp", () => {
	beforeEach(async () => {
		app = new jet.JetApp({
			start:"/Demo/Details", router: jet.EmptyRouter,
			debug: true,
			version: 2,
			views:{
				"Demo":{ rows:[{ $subview:true }] },
				"Details":{ template:"App" },
				"Other":new Promise(r => r({ template:"Other" })),
				"Change1":ChangeRouteFromInit,
				"Change2":ChangeRouteFromUrlChange
			}
		});
		return app.render("sandbox");
	})
	afterEach(function(){
		app.destructor();
	})

	it("can init", () => {
		// initialized
		expect(app).be.instanceOf(jet.JetApp);
		// config set
		expect(app.config.version).eq(2);

		// default route applied
		expect(app.getRouter().get()).eq("/Demo/Details");
		expect(app.getRoot().name).eq("layout")
		expect(app.getRoot().getChildViews()[0].name).eq("template")
	});

	it("can set empty url", async () => {
		expect(app.getUrlString()).to.eq("Demo/Details");
		await app.show("/Demo/Other")
		expect(app.getUrlString()).to.eq("Demo/Other");
		await app.show("")
		expect(app.getUrlString()).to.eq("Demo/Details");
	});

	it("can change ulr from handler", async () => {
		await app.show("Demo/Change1/Details")
		expect(app.getUrlString()).to.eq("Demo/Change1/Other");

		await app.show("Demo/Change2/Details")
		expect(app.getUrlString()).to.eq("Demo/Other");

		const a1 = app.show("Demo/Other")
		const a2 = app.show("Demo/Details")
		await Promise.all([a1, a2])
		expect(app.getUrlString()).to.eq("Demo/Details");
	});

});
var app;

describe("JetApp", () => {
	afterEach(function(){
		app.destructor();
	})

	it("can init", (next) => {
		app = new JetApp({
			start:"/Demo/Details",
			debug: true,
			version: 2,
			views:{
				"Demo":{ rows:[{ $subview:true }] },
				"Details":{ template:"App" }
			}
		});

		app.render().then( _ => {
			// initialized
			expect(app).be.instanceOf(JetApp);
			// config set
			expect(app.config.version).eq(2);

			// default route applied
			expect(app.getRouter().get()).eq("/Demo/Details");
			expect(app.getRoot().name).eq("layout")
			expect(app.getRoot().getChildViews()[0].name).eq("template")
			next();
		})
	});

});
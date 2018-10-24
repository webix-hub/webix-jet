var app;

describe("App in App", () => {
	const href = () => document.location.href.split("#")[1].slice(1);
	const baseUrl = document.location.href;
    before(function(){
        app = new jet.JetApp({
			start:"/Demo/SubApp",
			debug: true,
			version: 2,
			views:{
				"Demo":{ rows:[{ $subview:true }] },
                "Details":{ template:"App" },
                "SubApp" : SubApp
			}
		});
        return app.render("sandbox");
    })

	after(function(){
		app.destructor();
		window.history.pushState(null, null, baseUrl);
	})

	it("can navigate", async () => {
		expect(app.getUrlString()).to.equal("Demo/SubApp/top/body");
		expect(href()).to.equal("/Demo/SubApp/top/body");

		await $$("sb-tp").$scope.show("body2");
		expect(app.getUrlString()).to.equal("Demo/SubApp/top/body2");
		expect(href()).to.equal("/Demo/SubApp/top/body2");
		
		await app.show("/Demo/Details");
		expect(app.getUrlString()).to.equal("Demo/Details");
		expect(href()).to.equal("/Demo/Details");

		await app.show("/Demo/SubApp/top");
		expect(app.getUrlString()).to.equal("Demo/SubApp/top");
		expect(href()).to.equal("/Demo/SubApp/top");

		await app.show("/Demo/SubApp/body");
		expect(app.getUrlString()).to.equal("Demo/SubApp/body");
		expect(href()).to.equal("/Demo/SubApp/body");
	});

});
describe("Routers", () => {
    let app;
	const baseUrl = document.location.href;
    
    async function runTests(router, routerPrefix, href){
        app = new jet.JetApp({
            start:"/Demo/Details",
            routerPrefix,
            debug: true,
            router,
			version: 2,
			views:{
				"Demo":{ id:"tp", rows:[{ $subview:true }] },
                "Details":{ template:"App" },
                "Other" : { template:"Other" }
			}
        });

        await app.render("sandbox");
		expect(app.getUrlString()).to.equal("Demo/Details");
		if (href) expect(href()).to.equal("/Demo/Details");

		await $$("tp").$scope.show("Other");
		expect(app.getUrlString()).to.equal("Demo/Other");
		if (href) expect(href()).to.equal("/Demo/Other");

		await app.show("/Other");
		expect(app.getUrlString()).to.equal("Other");
		if (href) expect(href()).to.equal("/Other");

		await app.show("/Demo/Details");
		expect(app.getUrlString()).to.equal("Demo/Details");
		if (href) expect(href()).to.equal("/Demo/Details");
    }

	afterEach(function(){
		app.destructor();
		window.history.pushState(null, null, baseUrl);
	})

	it("hash router", async () => {
        await runTests(jet.HashRouter, "", () => document.location.href.split("#")[1]);
    });

    // can be executed in browser only
	// it("url router", async () => {
    //     const base = document.location.pathname;
    //     await runTests(jet.UrlRouter, base, () => document.location.pathname.replace(base, ""));
    // });

    it("empty router", async () => {
        await runTests(jet.EmptyRouter, "");
    });
    
	it("store router", async () => {
        await runTests(jet.StoreRouter, "");
    });

});
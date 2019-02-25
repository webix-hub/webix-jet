describe("SubViews", () => {
    let app;
    
    beforeEach(async() => {
        app = new jet.JetApp({
            start:"/Demo/Details",
            debug: true,
        	version: 2,
			views:{
                "Demo":{ id:"tp", rows:[{ $subview:true }] },
                "Normal":{ rows:[{ $subview:"SubView1" }, { $subview:true }]},
                "Branch":{ rows:[{ $subview:"SubView1", branch:true }, { $subview:true }]},
                "Details":{ template:"App" },
                "Other" : { template:"Other" },
                "SubView1": SubView1
			}
        });

        return app.render("sandbox");
    });

	afterEach(function(){
        app.destructor();
	});

	it("support branch option", async() => {
        await app.show("/Other")
        events = [];
        await app.show("/Demo/Normal/Details")
        await app.show("/Demo/Normal/Other")
        expect(events).to.deep.eq(["sub1-config", "sub1-init", "sub1-urlChange", "sub1-ready", "sub1-urlChange"])

        await app.show("/Other")
        events = [];
        await app.show("/Demo/Branch/Details")
        await app.show("/Demo/Branch/Other")
        expect(events).to.deep.eq(["sub1-config", "sub1-init", "sub1-urlChange", "sub1-ready"])
    });

});
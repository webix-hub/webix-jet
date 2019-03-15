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
                "Names":{ rows:[{ $subview:"Details", name:"sideway" }, { $subview:true }]},
                "Details":{ template:"App", localId:"details" },
                "Other" : { template:"Other", localId:"other" },
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

    it("support branch navigation from master view", async() => {
        await app.show("/Demo/Names/SubView1")
        let view = app.getRoot().queryView({ localId:"details"}).$scope;
        await view.show("Other", { target:"sideway" });

        //old view destroyed
        expect(!!view.getRoot()).to.eq(false)
        //new view created
        view = app.getRoot().queryView({ localId:"other"}).$scope;
        expect(!!view).to.eq(true)

        await view.show("Normal/Other", { target:"sideway" });
        view = app.getRoot().queryView({ localId:"other"}).$scope;
        const jview = view.getParentView();

        await view.show("Normal/Normal/Other", { target:"sideway" });
        view = app.getRoot().queryView({ localId:"other"}).$scope;
        const jview2 = view.getParentView().getParentView();
        expect(jview).to.eq(jview2)

        expect(jview.getUrlString()).to.eq("Normal/Normal/Other")

        await app.show("/SubView1")
        expect(!!jview.getRoot()).to.eq(false)
    });

});
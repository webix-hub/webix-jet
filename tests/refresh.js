describe("View refreshing", ()=>{
    var app;
    before(function(){
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/url/here",
            debug: true,
            counter: 1,
            views:{
                "some":{ rows:[{ $subview:true }] },
                "url":{ rows:[{ $subview:true }] },
                "here":{ template:() => app.config.counter, localId:"h1" },
                "there":{ template:"s2", localId:"t1" }
            }
        });
        return app.render("sandbox")
    })
    after(function(){
        app.destructor();
    })


    it("must refresh a single view", async () => {
        const view = app.getRoot().queryView({ localId : "h1" }).$scope;
        let text = view.getRoot().$view.innerText.trim();
        expect(text).to.equal("1");

        app.config.counter++;
        await view.refresh();

        text = view.getRoot().$view.innerText.trim();
        expect(text).to.equal("2");

        await view.show("./there");
        const there = app.getRoot().queryView({ localId : "t1" });
        expect( !!there ).to.equal(true);

        await app.show("/some/url/here");
    });

    it("must refresh a whole app", async () => {
        let view = app.getRoot().queryView({ localId : "h1" }).$scope;
        let text = view.getRoot().$view.innerText.trim();
        expect(text).to.equal("2");

        app.config.counter++;
        await app.refresh();
        
        view = app.getRoot().queryView({ localId : "h1" }).$scope;
        text = view.getRoot().$view.innerText.trim();
        expect(text).to.equal("3");

        await view.show("./there");
        
        let there = app.getRoot().queryView({ localId : "t1" });
        expect( !!there ).to.equal(true);

        await app.show("/url/there");

        there = app.getRoot().queryView({ localId : "t1" });
        expect( !!there ).to.equal(true);
    });
});
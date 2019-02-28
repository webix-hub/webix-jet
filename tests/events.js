describe("Events", ()=>{
    var app;
    before(function(){
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/url/here",
            debug: true,
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


    it("app:guard", async () => {
        let counter = 0;
        app.on("app:guard", () => counter++)
        await app.show("/some/url/there");
        expect(counter).to.equal(1);
    });
});
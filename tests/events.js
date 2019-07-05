describe("Events", ()=>{
    var app;
    before(function(){
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/url/here",
            debug: false,
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

    it("app:guard", async () => {
        app.on("app:guard", () => false )
        let error = null;

        await (app.show("/some/url/there").catch(e => {
            error = e;
        }));

        console.log(text)

        expect(error).instanceof(jet.errors.NavigationBlocked);
    });
});
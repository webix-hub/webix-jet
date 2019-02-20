describe("Destructors", ()=>{

    it("must remove all HTML on destruction (top-level navigation)", () => {
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/there",
            debug: true,
            views:{
                "some":{ id:"s1", rows:[{ $subview:true }] },
                "url":{ id:"s2", rows:[{ $subview:true }] },
                "here":{ id:"s31", template:"s1", localId:"h1" },
                "there":{ id:"s32", template:"s2", localId:"t1" }
            }
        });

        return app.render("sandbox").then(() => {
            expect(!!$$("s1") ).to.equal(false);
            expect(!!$$("s2") ).to.equal(false);
            expect(!!$$("s31") ).to.equal(false);
            expect(!!$$("s32") ).to.equal(true);

            return app.show("/some/url/here")
        }).then(() => {
        
            expect(!!$$("s1") ).to.equal(true);
            expect(!!$$("s2") ).to.equal(true);
            expect(!!$$("s31") ).to.equal(true);
            expect(!!$$("s32") ).to.equal(false);

            app.destructor();

            expect(!!$$("s1") ).to.equal(false);
            expect(!!$$("s2") ).to.equal(false);
            expect(!!$$("s31") ).to.equal(false);
            expect(!!$$("s32") ).to.equal(false);
        });
    });

    it("must remove all HTML on destruction (sub-level navigation)", () => {
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/url/there",
            debug: true,
            views:{
                "some":{ id:"s1", rows:[{ $subview:true }] },
                "url":{ id:"s2", rows:[{ $subview:true }] },
                "here":{ id:"s31", template:"s1", localId:"h1" },
                "there":{ id:"s32", template:"s2", localId:"t1" }
            }
        });

        return app.render("sandbox").then(() => {
            expect(!!$$("s1") ).to.equal(true);
            expect(!!$$("s2") ).to.equal(true);
            expect(!!$$("s31") ).to.equal(false);
            expect(!!$$("s32") ).to.equal(true);

            return app.show("/some/url/here")
        }).then(() => {
        
            expect(!!$$("s1") ).to.equal(true);
            expect(!!$$("s2") ).to.equal(true);
            expect(!!$$("s31") ).to.equal(true);
            expect(!!$$("s32") ).to.equal(false);

            app.destructor();

            expect(!!$$("s1") ).to.equal(false);
            expect(!!$$("s2") ).to.equal(false);
            expect(!!$$("s31") ).to.equal(false);
            expect(!!$$("s32") ).to.equal(false);
        });
    });

});
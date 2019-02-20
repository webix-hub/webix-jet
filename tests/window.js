describe("route to window ", ()=>{
    var app;
    before(function(){
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/url/there",
            debug: true,
            counter: 1,
            views:{
                "some":{ rows:[{ $subview:true }] },
                "url":{ rows:[{ $subview:true, popup:true }] },
                "here":{ view:"window", modal:true, id:"h1", body:{ $subview:true }},
                "there":{ template:"s2", id:"t1" },
                "dummy":{ template:"dummy" }
            }
        });
        return app.render("sandbox")
    })
    after(function(){
        app.destructor();
    })


    it("can use default router to window", async () => {
        await app.show("/some/url/here/there");
        const win = webix.$$("h1");
        expect( !!win ).to.equal( true );
        expect( !!win.isVisible() ).to.equal( true );
        expect( win.$scope ).to.equal( app.getSubView().getSubView().getSubView() );

        await win.$scope.show("./some/there");
        expect(win.queryView({ id:"t1" }).config.id).to.equal("t1");
        expect(app.getUrlString()).to.equal("some/url/here/some/there")

        await app.show("/there");
        expect( !!webix.$$("h1") ).to.equal( false );
    });

    it("can use show to window", async () => {
        await app.show("/dummy");
        const top = app.getSubView();

        await top.show("./here/there", { target:"_top" });

        const win = webix.$$("h1");
        expect( !!win ).to.equal( true );
        expect( !!win.isVisible() ).to.equal( true );
        expect( !!webix.$$("t1") ).to.equal( true );
        expect( win.getBody().config.id ).to.equal( "t1")
        expect( win.$scope.getParentView() ).to.equal( top );
        expect( app.getUrlString() ).to.equal( "dummy" );

        await win.$scope.show("./url");
        expect( !!webix.$$("h1") ).to.equal( true );
        expect( !!webix.$$("t1") ).to.equal( false );
        expect( app.getUrlString() ).to.equal( "dummy" );

        await top.show("/some");
        expect( !!webix.$$("h1") ).to.equal( false );
    });
});
describe("Menu plugin", ()=>{
    let app;
    afterEach(function(){
        app.destructor();
    })
    
    it("must mark page on url change", async () => {
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/two",
            debug: true,
            views:{
                "some": MenuView,
                "one":{  },
                "two":{  },
                "three": {  }
            }
        });

        await app.render("sandbox");
        expect(webix.$$("s1").getValue()).to.equal("two");

        await app.show("/some/one");
        expect(webix.$$("s1").getValue()).to.equal("one");

        await app.show("/some/two");
        expect(webix.$$("s1").getValue()).to.equal("two");

        await app.show("/some/three");
        expect(webix.$$("s1").getValue()).to.equal("three");

        await app.show("/some");
    });

    it("must work from sub-views", async () => {
        app = new jet.JetApp({
            router: jet.EmptyRouter,
            start:"/some/two",
            debug: true,
            views:{
                "some": TopMenuView,
                "submenu" : SubMenuView,
                "one":{  },
                "two":{  },
                "three": {  }
            }
        });

        await app.render("sandbox");
        expect(webix.$$("s1").getValue()).to.equal("two");

        await app.show("/some/one");
        expect(webix.$$("s1").getValue()).to.equal("one");

        await app.show("/some/two");
        expect(webix.$$("s1").getValue()).to.equal("two");

        await app.show("/some/three");
        expect(webix.$$("s1").getValue()).to.equal("three");
        
    });
});
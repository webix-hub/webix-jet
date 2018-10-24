(function(){

    var app;
    
    describe("Locale plugin", ()=>{
        before(function(){
            class AppView extends jet.JetView {
                config(){
                    const _ = this.app.getService("locale")._;
                    return { id:"b1", view:"button", value: _("test") }
                }
            }

            app = new jet.JetApp({
                router: jet.EmptyRouter,
                start:"/here",
                debug: true,
                views:{
                    here: AppView
                }
            });

            app.use(jet.plugins.Locale, { path:false });
            app.getService("locale").setLangData("en", { test:"Test" });

            return app.render("sandbox")
        });

        after(function(){
            app.destructor();
        });

        it("must apply default locale", () => {
            expect($$("b1").getValue()).to.equal("Test")
        });

        it("must set custom object as locale", () => {
            const locale = app.getService("locale");
            return locale.setLangData("ru", { test:"Тест" }).then(() => {
                expect($$("b1").getValue()).to.equal("Тест");
            });
        });
    });
    
})();
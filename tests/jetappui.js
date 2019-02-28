describe("webix.ui.jetapp", ()=>{
    var app;
    before(function(){
        webix.protoUI({
            name:"subapp",
            app: SubApp
        }, webix.ui.jetapp);
    })

    it("can use inner navigation", async () => {
        const ui = webix.ui({ view:"subapp", id:"d1",  router: jet.EmptyRouter });
        await(ui.$app.ready);
        const topView = ui.$app.getSubView();
        await ui.$app.show("body2");

        expect(ui.$app.getUrlString()).to.eq("body2");
        expect(!!topView.getSubView()).to.eq(false);

        ui.destructor();
    });
});
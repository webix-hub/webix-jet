describe("Destroy mid-render", () => {
    let app;

    afterEach(function(){
        try { app.destructor(); } catch(e){}
    });

    // Repro of the reported bug: a jetapp widget (e.g. Webix Query) whose
    // initial fire-and-forget render (patch.ts $app.render({id})) is still in flight
    // when the widget is destroyed -> _render_final lands on the destroyed body cell.
    it("silently no-ops when a jetapp widget is destroyed mid-render (widget.destructor())", async () => {
        let release;
        const gate = new Promise(r => { release = r; });

        class Slow extends jet.JetView {
            config(){ return gate.then(() => ({ template:"q" })); }
        }
        class MiniApp extends jet.JetApp {
            constructor(cfg){
                super(Object.assign({ router: jet.EmptyRouter, start:"/Slow", views:{ Slow } }, cfg));
            }
        }
        webix.protoUI({ name:"jet_miniapp", app: MiniApp }, webix.ui.jetapp);

        const unhandled = [];
        const onRej = e => { unhandled.push(e.reason); e.preventDefault(); };
        window.addEventListener("unhandledrejection", onRej);

        const ui = webix.ui({ view:"jet_miniapp", container:"sandbox" }); // $ready -> $app.render({id}), fire-and-forget
        ui.destructor();   // destroy the widget while its initial render is in flight
        release();         // config resolves -> _render_final on the destroyed slot

        await new Promise(r => setTimeout(r, 50));
        window.removeEventListener("unhandledrejection", onRej);

        // pre-fix: "Uncaught (in promise) null" leaks from the fire-and-forget $app.render
        expect(unhandled.length).to.equal(0);
    });

});

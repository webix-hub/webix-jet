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

    // a blocked navigation that rejects while an earlier async render is
    // still parked must not leak — its handler has to be attached to `ready` directly, not
    // to the queued `this.ready.then(...)` chain (which only runs after the parked one settles).
    it("does not leak a benign rejection when a blocked navigation overlaps a parked render", async () => {
        let release;
        const gate = new Promise(r => { release = r; });

        class Table extends jet.JetView {
            config(){ return gate.then(() => ({ template:"t" })); }
        }
        app = new jet.JetApp({ router: jet.EmptyRouter, start:"/Table",
            views:{ Table, secret:{ template:"secret" } } });
        app.attachEvent("app:guard", url => url.indexOf("secret") === -1);

        const unhandled = [];
        const onRej = e => { unhandled.push(e.reason); e.preventDefault(); };
        window.addEventListener("unhandledrejection", onRej);

        app.render("sandbox");   // ready #1 parked on the gate
        app.show("/secret");     // ready #2 blocked -> rejects this turn, intentionally uncaught

        // keep ready #1 parked across a task boundary: with the old code ready #2's handler
        // is queued behind it, so ready #2 is unhandled at the microtask checkpoint here
        await new Promise(r => setTimeout(r, 50));
        window.removeEventListener("unhandledrejection", onRej);

        // pre-fix: ready #2 has no handler yet (queued behind the parked ready #1) -> unhandled
        expect(unhandled.length).to.equal(0);

        release();   // let the parked render settle before teardown
    });

    // destroying a jetapp widget must tear down its app (shared destructor),
    // so the render continuation does not run router.set()/app:route on a dead app.
    it("does not touch the router after a jetapp widget is destroyed mid-render", async () => {
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
        webix.protoUI({ name:"jet_miniapp2", app: MiniApp }, webix.ui.jetapp);

        const ui = webix.ui({ view:"jet_miniapp2", container:"sandbox" });
        app = ui.$app;   // let afterEach clean up

        let routeAfterDestroy = 0;
        let destroyed = false;
        ui.$app.attachEvent("app:route", () => { if (destroyed) routeAfterDestroy++; });

        destroyed = true;
        ui.destructor();   // shared destructor -> $app.destructor() -> app._container nulled
        release();         // config resolves -> render continuation runs on a dead app

        await new Promise(r => setTimeout(r, 50));

        // pre-fix (no shared destructor): app still alive -> continuation fires app:route
        expect(routeAfterDestroy).to.equal(0);
    });

});

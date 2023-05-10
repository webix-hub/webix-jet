import { JetApp, EmptyRouter } from "../sources/index";
import { afterEach, beforeAll, beforeEach, it, expect } from "vitest";

import { loadWebix } from "./stubs/helpers";
import { JetView, plugins } from "../sources/index";

let app;

beforeAll(async () => {
    await loadWebix();
});
afterEach(function(){
	try{ app.destructor(); } catch(e){}
});



beforeEach(function(){
    class AppView extends JetView {
        config(){
            const _ = this.app.getService("locale")._;
            return { id:"b1", view:"button", value: _("test") }
        }
    }

    app = new JetApp({
        router: EmptyRouter,
        start:"/here",
        debug: true,
        views:{
            here: AppView
        }
    });

    app.use(plugins.Locale, { path:false, webix:{ en:"en-US", es:"es-ES" } });
    app.getService("locale").setLangData("en", { test:"Test" });

    return app.render(document.body)
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

it("must work with webix.i18n", () => {
    const locale = app.getService("locale");
    locale.setLangData("en", { test:"" });
    expect(app.webix.i18n.calendar.hours).to.eq("Hours");
    locale.setLangData("es", { test:"" });
    expect(app.webix.i18n.calendar.hours).to.eq("Horas");
    locale.setLangData("fr", { test:"" });
    expect(app.webix.i18n.calendar.hours).to.eq("Horas");
});
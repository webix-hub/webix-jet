import Polyglot from "node-polyglot/build/polyglot";
export function Locale(app, view, config) {
    config = config || {};
    var storage = config.storage;
    var lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");
    var service = {
        _: null,
        polyglot: null,
        getLang: function () { return lang; },
        setLang: function (name, silent) {
            var path = (config.path ? config.path + "/" : "") + name;
            var data = require("jet-locales/" + path);
            if (data.__esModule) {
                data = data.default;
            }
            var poly = service.polyglot = new Polyglot({ phrases: data });
            poly.locale(name);
            service._ = webix.bind(poly.t, poly);
            lang = name;
            if (storage) {
                storage.put("lang", lang);
            }
            if (!silent) {
                app.refresh();
            }
        }
    };
    app.setService("locale", service);
    service.setLang(lang, true);
}

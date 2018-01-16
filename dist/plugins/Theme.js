export function Theme(app, view, config) {
    config = config || {};
    var storage = config.storage;
    var theme = storage ? storage.get("theme") : (config.theme || "flat-default");
    var service = {
        getTheme: function () { return theme; },
        setTheme: function (name, silent) {
            var parts = name.split("-");
            var links = document.getElementsByTagName("link");
            for (var i = 0; i < links.length; i++) {
                var lname = links[i].getAttribute("title");
                if (lname) {
                    if (lname === name || lname === parts[0]) {
                        links[i].disabled = false;
                    }
                    else {
                        links[i].disabled = true;
                    }
                }
            }
            webix.skin.set(parts[0]);
            //remove old css
            webix.html.removeCss(document.body, "theme-" + theme);
            //add new css
            webix.html.addCss(document.body, "theme-" + name);
            theme = name;
            if (storage) {
                storage.put("theme", name);
            }
            if (!silent) {
                app.refresh();
            }
        }
    };
    app.setService("theme", service);
    service.setTheme(theme, true);
}

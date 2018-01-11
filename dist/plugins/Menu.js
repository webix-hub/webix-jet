function show(view, config, value) {
    if (config.urls) {
        value = config.urls[value] || value;
    }
    view.show("./" + value);
}
export function Menu(app, view, config) {
    var ui = view.$$(config.id || config);
    var silent = false;
    ui.attachEvent("onchange", function () {
        if (!silent) {
            show(view, config, this.getValue());
        }
    });
    ui.attachEvent("onafterselect", function () {
        if (!silent) {
            var id = null;
            if (ui.setValue) {
                id = this.getValue();
            }
            else if (ui.getSelectedId) {
                id = ui.getSelectedId();
            }
            show(view, config, id);
        }
    });
    view.on(app, "app:route", function (url) {
        var segment = url[view.getIndex()];
        if (segment) {
            silent = true;
            var page = segment.page;
            if (ui.setValue && ui.getValue() !== page) {
                ui.setValue(page);
            }
            else if (ui.select && ui.exists(page) && ui.getSelectedId() !== page) {
                ui.select(page);
            }
            silent = false;
        }
    });
}

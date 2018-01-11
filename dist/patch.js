var w = webix;
var version = webix.version.split(".");
// will be fixed in webix 5.2
if (version[0] * 10 + version[1] * 1 < 52) {
    w.ui.freeze = function (handler) {
        // disabled because webix jet 5.0 can't handle resize of scrollview correctly
        // w.ui.$freeze = true;
        var res = handler();
        if (res && res.then) {
            res.then(function (some) {
                w.ui.$freeze = false;
                w.ui.resize();
                return some;
            });
        }
        else {
            w.ui.$freeze = false;
            w.ui.resize();
        }
        return res;
    };
}

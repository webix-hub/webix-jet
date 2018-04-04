var w = webix;
var version = webix.version.split(".");
// will be fixed in webix 5.2
if (version[0] * 10 + version[1] * 1 < 52) {
    w.ui.freeze = function (handler) {
        // disabled because webix jet 5.0 can't handle resize of scrollview correctly
        // w.ui.$freeze = true;this.$scope
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
// adding views as classes
var baseAdd = w.ui.baselayout.prototype.addView;
var baseRemove = w.ui.baselayout.prototype.removeView;
var config = {
    addView: function (view, index) {
        if (this.$scope && this.$scope.webixJet) {
            var jview = this.$scope;
            var subs = {};
            view = jview.app.copyConfig(view, {}, subs);
            baseAdd.apply(this, [view, index]);
            for (var key in subs) {
                jview._subs[key] = subs[key];
                jview._renderFrame(key, subs[key], jview.getUrl());
            }
            return view.id;
        }
        else {
            return baseAdd.apply(this, arguments);
        }
    },
    removeView: function () {
        baseRemove.apply(this, arguments);
        if (this.$scope && this.$scope.webixJet) {
            var subs = this.$scope._subs;
            for (var key in subs) {
                if (!webix.$$(subs[key].id)) {
                    delete subs[key];
                }
            }
        }
    }
};
w.extend(w.ui.layout.prototype, config, true);
w.extend(w.ui.baselayout.prototype, config, true);

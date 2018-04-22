var w = webix;
var version = webix.version.split(".");
// will be fixed in webix 5.3
if (version[0] * 10 + version[1] * 1 < 53) {
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
// adding views as classes
var baseAdd = w.ui.baselayout.prototype.addView;
var baseRemove = w.ui.baselayout.prototype.removeView;
var config = {
    addView: function (view, index) {
        if (this.$scope && this.$scope.webixJet) {
            var jview_1 = this.$scope;
            var subs_1 = {};
            view = jview_1.app.copyConfig(view, {}, subs_1);
            baseAdd.apply(this, [view, index]);
            var _loop_1 = function (key) {
                jview_1._renderFrame(key, subs_1[key], jview_1.getUrl()).then(function () {
                    jview_1._subs[key] = subs_1[key];
                });
            };
            for (var key in subs_1) {
                _loop_1(key);
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
// wrapper for using Jet Apps as views
webix.protoUI({
    name: "jetapp",
    $init: function (cfg) {
        this.$app = new this.app(cfg);
        var id = webix.uid().toString();
        this.setBody({ id: id });
        this.$ready.push(function () {
            var _this = this;
            this.$app.render(webix.$$(id)).then(function (view) {
                _this.setBody(view);
            });
        });
    },
    getChildViews: function () {
        return [this._body_cell];
    },
    getBody: function () {
        return this._body_cell;
    },
    setBody: function (view) {
        if (!view.config) {
            view = webix.ui(view, this.$view);
        }
        this._body_cell = view;
    },
    $setSize: function (x, y) {
        webix.ui.view.prototype.$setSize.call(this, x, y);
        this._body_cell.$setSize(this.$width, this.$height);
    },
    $getSize: function (dx, dy) {
        var selfSize = webix.ui.view.prototype.$getSize.call(this, dx, dy);
        var size = this.getBody().$getSize(dx, dy);
        size[0] = Math.max(selfSize[0], size[0]);
        size[1] = Math.min(selfSize[1], size[1]);
        size[2] = Math.max(selfSize[2], size[2]);
        size[3] = Math.min(selfSize[3], size[3]);
        size[4] = Math.max(selfSize[4], size[4]);
        return size;
    }
}, webix.ui.view);

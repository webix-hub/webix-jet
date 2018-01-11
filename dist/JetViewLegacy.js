var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { JetView } from "./JetView";
// wrapper for raw objects and Jet 1.x structs
var JetViewLegacy = (function (_super) {
    __extends(JetViewLegacy, _super);
    function JetViewLegacy(app, name, ui) {
        var _this = _super.call(this, app, name) || this;
        _this._ui = ui;
        _this._windows = [];
        return _this;
    }
    JetViewLegacy.prototype.getRoot = function () {
        if (this.app.config.jet1xMode) {
            var parent_1 = this.getParentView();
            if (parent_1) {
                return parent_1.getRoot();
            }
        }
        return this._root;
    };
    JetViewLegacy.prototype.config = function () {
        return this._ui.$ui || this._ui;
    };
    JetViewLegacy.prototype.destructor = function () {
        var destroy = this._ui.$ondestroy;
        if (destroy) {
            destroy();
        }
        for (var _i = 0, _a = this._windows; _i < _a.length; _i++) {
            var window_1 = _a[_i];
            window_1.destructor();
        }
        _super.prototype.destructor.call(this);
    };
    JetViewLegacy.prototype.show = function (path, config) {
        if (path.indexOf("/") === 0 || path.indexOf("./") === 0) {
            return _super.prototype.show.call(this, path, config);
        }
        _super.prototype.show.call(this, "../" + path, config);
    };
    JetViewLegacy.prototype.init = function () {
        if (this.app.config.legacyEarlyInit) {
            this._realInitHandler();
        }
    };
    JetViewLegacy.prototype.ready = function () {
        if (!this.app.config.legacyEarlyInit) {
            this._realInitHandler();
        }
    };
    JetViewLegacy.prototype._realInitHandler = function () {
        var init = this._ui.$oninit;
        if (init) {
            var root = this.getRoot();
            init(root, root.$scope);
        }
        var events = this._ui.$onevent;
        if (events) {
            for (var key in events) {
                this.on(this.app, key, events[key]);
            }
        }
        var windows = this._ui.$windows;
        if (windows) {
            for (var _i = 0, windows_1 = windows; _i < windows_1.length; _i++) {
                var conf = windows_1[_i];
                if (conf.$ui) {
                    var view = new JetViewLegacy(this.app, this.getName(), conf);
                    view.render(document.body);
                    this._windows.push(view);
                }
                else {
                    this.ui(conf);
                }
            }
        }
    };
    JetViewLegacy.prototype._urlChange = function (url) {
        var _this = this;
        return _super.prototype._urlChange.call(this, url).then(function () {
            var onurlchange = _this._ui.$onurlchange;
            if (onurlchange) {
                var root = _this.getRoot();
                onurlchange(url[0].params, url.slice(1), root.$scope);
            }
        });
    };
    return JetViewLegacy;
}(JetView));
export { JetViewLegacy };

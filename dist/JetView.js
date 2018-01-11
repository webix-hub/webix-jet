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
import { JetBase } from "./JetBase";
import { parse, url2str } from "./helpers";
var JetView = (function (_super) {
    __extends(JetView, _super);
    function JetView(app, name) {
        var _this = _super.call(this) || this;
        _this.app = app;
        _this._name = name;
        _this._children = [];
        return _this;
    }
    JetView.prototype.ui = function (ui, config) {
        config = config || {};
        var container = config.container || ui.container;
        var jetview = this.app.createView(ui);
        this._children.push(jetview);
        jetview.render(container, null, this);
        if (typeof ui !== "object" || (ui instanceof JetBase)) {
            // raw webix UI
            return jetview;
        }
        else {
            return jetview.getRoot();
        }
    };
    JetView.prototype.show = function (path, config) {
        var _this = this;
        config = config || {};
        // detect the related view
        if (typeof path === "string") {
            // root path
            if (path.substr(0, 1) === "/") {
                return this.app.show(path);
            }
            // parent path, call parent view
            if (path.indexOf("../") === 0) {
                var parent_1 = this.getParentView();
                if (parent_1) {
                    parent_1.show("./" + path.substr(3), config);
                }
                else {
                    this.app.show("/" + path.substr(3));
                }
                return;
            }
            // local path, do nothing
            if (path.indexOf("./") === 0) {
                path = path.substr(2);
            }
            var sub = this.getSubViewInfo(config.target);
            if (!sub) {
                return this.app.show("/" + path);
            }
            if (sub.parent !== this) {
                return sub.parent.show(path, config);
            }
        }
        var currentUrl = parse(this.app.getRouter().get());
        // convert parameters to url
        if (typeof path === "object") {
            if (webix.isArray(path)) {
                currentUrl[this._index + path[0]].page = path[1];
                path = "";
            }
            else {
                var temp = [];
                for (var key in path) {
                    temp.push(encodeURIComponent(key) + "=" + encodeURIComponent(path[key]));
                }
                path = "?" + temp.join("&");
            }
        }
        // process url
        if (typeof path === "string") {
            // parameters only
            if (path.substr(0, 1) === "?") {
                var next = path.indexOf("/");
                var params = path;
                if (next > -1) {
                    params = path.substr(0, next);
                }
                var chunk = parse(params);
                webix.extend(currentUrl[this._index - 1].params, chunk[0].params, true);
                path = next > -1 ? path.substr(next + 1) : "";
            }
            var newChunk = path === "" ? currentUrl.slice(this._index) : parse(path);
            var url_1 = null;
            if (this._index) {
                url_1 = currentUrl.slice(0, this._index).concat(newChunk);
                for (var i = 0; i < url_1.length; i++) {
                    url_1[i].index = i + 1;
                }
                var urlstr_1 = url2str(url_1);
                return this.app.canNavigate(urlstr_1, this).then(function (redirect) {
                    if (urlstr_1 !== redirect) {
                        // url was blocked and redirected
                        return _this.app.show(redirect);
                    }
                    else {
                        return _this._finishShow(url_1, redirect);
                    }
                }).catch(function () { return false; });
            }
            else {
                return this._finishShow(newChunk, "");
            }
        }
    };
    JetView.prototype.init = function (_$view, _$url) {
        // stub
    };
    JetView.prototype.ready = function (_$view, _$url) {
        // stub
    };
    JetView.prototype.config = function () {
        this.app.webix.message("View:Config is not implemented");
    };
    JetView.prototype.urlChange = function (_$view, _$url) {
        // stub
    };
    JetView.prototype.destroy = function () {
        // stub
    };
    JetView.prototype.destructor = function () {
        this.destroy();
        // destroy child views
        var uis = this._children;
        for (var i = uis.length - 1; i >= 0; i--) {
            if (uis[i] && uis[i].destructor) {
                uis[i].destructor();
            }
        }
        // reset vars for better GC processing
        this.app = this._children = null;
        // destroy actual UI
        this._root.destructor();
        _super.prototype.destructor.call(this);
    };
    JetView.prototype.use = function (plugin, config) {
        plugin(this.app, this, config);
    };
    JetView.prototype._render = function (url) {
        var _this = this;
        var config = this.config();
        if (config.then) {
            return config.then(function (cfg) { return _this._render_final(cfg, url); });
        }
        else {
            return this._render_final(config, url);
        }
    };
    JetView.prototype._render_final = function (config, url) {
        var _this = this;
        var response;
        // using wrapper object, so ui can be changed from app:render event
        var result = { ui: {} };
        this.app.copyConfig(config, result.ui, this._subs);
        this.app.callEvent("app:render", [this, url, result]);
        result.ui.$scope = this;
        try {
            this._root = this.app.webix.ui(result.ui, this._container);
            if (this._root.getParentView()) {
                this._container = this._root;
            }
            this._init(this._root, url);
            response = this._urlChange(url).then(function () {
                return _this.ready(_this._root, url);
            });
        }
        catch (e) {
            response = Promise.reject(e);
        }
        return response.catch(function (err) { return _this._initError(_this, err); });
    };
    JetView.prototype._init = function (view, url) {
        return this.init(view, url);
    };
    JetView.prototype._urlChange = function (url) {
        var _this = this;
        this.app.callEvent("app:urlchange", [this, url, this._index]);
        var waits = [];
        for (var key in this._subs) {
            var frame = this._subs[key];
            if (frame.url) {
                // we have fixed subview url
                if (typeof frame.url === "string") {
                    var parsed = parse(frame.url);
                    parsed.map(function (a) { a.index = 0; });
                    waits.push(this._createSubView(frame, parsed));
                }
                else {
                    var view = frame.view;
                    if (typeof frame.url === "function" && !(view instanceof frame.url)) {
                        view = new frame.url(this.app, "");
                    }
                    if (!view) {
                        view = frame.url;
                    }
                    waits.push(this._renderSubView(frame, view, url));
                }
            }
            else if (key === "default" && url && url.length > 1) {
                // we have an url and subview for it
                var suburl = url.slice(1);
                waits.push(this._createSubView(frame, suburl));
            }
        }
        return Promise.all(waits).then(function () {
            _this.urlChange(_this._root, url);
        });
    };
    JetView.prototype._initError = function (view, err) {
        this.app.error("app:error:initview", [err, view]);
        return true;
    };
    JetView.prototype._createSubView = function (sub, suburl) {
        var _this = this;
        return this.app.createFromURL(suburl, sub.view).then(function (view) {
            return _this._renderSubView(sub, view, suburl);
        });
    };
    JetView.prototype._renderSubView = function (sub, view, suburl) {
        var cell = this.app.webix.$$(sub.id);
        return view.render(cell, suburl, this).then(function (ui) {
            // destroy old view
            if (sub.view && sub.view !== view) {
                sub.view.destructor();
            }
            // save info about a new view
            sub.view = view;
            sub.id = ui.config.id;
            return ui;
        });
    };
    JetView.prototype._finishShow = function (url, path) {
        var next;
        if (this._index) {
            next = this._renderPartial(url.slice(this._index - 1));
            this.app.getRouter().set(path, { silent: true });
            this.app.callEvent("app:route", [url]);
        }
        else {
            url.map(function (a) { return a.index = 0; });
            next = this._renderPartial([null].concat(url));
        }
        return next;
    };
    JetView.prototype._renderPartial = function (url) {
        this._init_url_data(url);
        return this._urlChange(url);
    };
    return JetView;
}(JetBase));
export { JetView };

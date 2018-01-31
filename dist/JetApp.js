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
import { JetView } from "./JetView";
import { JetViewLegacy } from "./JetViewLegacy";
import { JetViewRaw } from "./JetViewRaw";
import { HashRouter } from "./routers/HashRouter";
import { parse, url2str } from "./helpers";
import "./patch";
var JetApp = (function (_super) {
    __extends(JetApp, _super);
    function JetApp(config) {
        var _this = _super.call(this) || this;
        _this.webix = config.webix || webix;
        // init config
        _this.config = _this.webix.extend({
            name: "App",
            version: "1.0",
            start: "/home"
        }, config, true);
        _this._name = _this.config.name;
        _this._services = {};
        webix.extend(_this, webix.EventSystem);
        return _this;
    }
    JetApp.prototype.getService = function (name) {
        var obj = this._services[name];
        if (typeof obj === "function") {
            obj = this._services[name] = obj(this);
        }
        return obj;
    };
    JetApp.prototype.setService = function (name, handler) {
        this._services[name] = handler;
    };
    // copy object and collect extra handlers
    JetApp.prototype.copyConfig = function (obj, target, config) {
        // raw ui config
        if (obj.$ui) {
            obj = { $subview: new JetViewLegacy(this, "", obj) };
        }
        else if (obj instanceof JetApp) {
            obj = { $subview: obj };
        }
        // subview placeholder
        if (obj.$subview) {
            return this.addSubView(obj, target, config);
        }
        // process sub-properties
        target = target || (obj instanceof Array ? [] : {});
        for (var method in obj) {
            var point = obj[method];
            // view class
            if (typeof point === "function" &&
                point.prototype && point.prototype.config) {
                point = { $subview: point };
            }
            if (point && typeof point === "object" &&
                !(point instanceof webix.DataCollection)) {
                if (point instanceof Date) {
                    target[method] = new Date(point);
                }
                else {
                    target[method] = this.copyConfig(point, (point instanceof Array ? [] : {}), config);
                }
            }
            else {
                target[method] = point;
            }
        }
        return target;
    };
    JetApp.prototype.getRouter = function () {
        return this.$router;
    };
    JetApp.prototype.clickHandler = function (e) {
        if (e) {
            var target = (e.target || e.srcElement);
            if (target && target.getAttribute) {
                var trigger = target.getAttribute("trigger");
                if (trigger) {
                    this.trigger(trigger);
                }
                var route = target.getAttribute("route");
                if (route) {
                    this.show(route);
                }
            }
        }
    };
    JetApp.prototype.refresh = function () {
        var temp = this._container;
        this._view.destructor();
        this._view = this._container = null;
        this.render(temp, parse(this.getRouter().get()), this._parent);
    };
    JetApp.prototype.loadView = function (url) {
        var _this = this;
        var views = this.config.views;
        var result = null;
        if (url === "") {
            return Promise.resolve(this._loadError("", new Error("Webix Jet: Empty url segment")));
        }
        try {
            if (views) {
                if (typeof views === "function") {
                    // custom loading strategy
                    result = views(url);
                }
                else {
                    // predefined hash
                    result = views[url];
                }
                if (typeof result === "string") {
                    url = result;
                    result = null;
                }
            }
            if (!result) {
                url = url.replace(/\./g, "/");
                var view = require("jet-views/" + url);
                if (view.__esModule) {
                    view = view.default;
                }
                result = view;
            }
        }
        catch (e) {
            result = this._loadError(url, e);
        }
        // custom handler can return view or its promise
        if (!result.then) {
            result = Promise.resolve(result);
        }
        // set error handler
        result = result.catch(function (err) { return _this._loadError(url, err); });
        return result;
    };
    JetApp.prototype.createFromURL = function (url, now) {
        var _this = this;
        var chunk = url[0];
        var name = chunk.page;
        var view;
        if (now && now.getName() === name) {
            view = Promise.resolve(now);
        }
        else {
            view = this.loadView(chunk.page)
                .then(function (ui) { return _this.createView(ui, name); });
        }
        return view;
    };
    JetApp.prototype.createView = function (ui, name) {
        var obj;
        if (typeof ui === "function") {
            if (ui.prototype && ui.prototype.show) {
                // UI class
                return new ui(this, name);
            }
            else {
                // UI factory functions
                ui = ui();
            }
        }
        if (ui instanceof JetApp || ui instanceof JetView) {
            obj = ui;
        }
        else {
            // UI object
            if (ui.$ui) {
                obj = new JetViewLegacy(this, name, ui);
            }
            else {
                obj = new JetViewRaw(this, name, ui);
            }
        }
        return obj;
    };
    // show view path
    JetApp.prototype.show = function (name) {
        if (this.$router.get() !== name) {
            this._render(name);
        }
        else {
            return Promise.resolve(true);
        }
    };
    JetApp.prototype.canNavigate = function (url, view) {
        var obj = {
            url: parse(url),
            redirect: url,
            confirm: Promise.resolve(true)
        };
        var res = this.callEvent("app:guard", [url, (view || this._view), obj]);
        if (!res) {
            return Promise.reject("");
        }
        return obj.confirm.then(function () { return obj.redirect; });
    };
    JetApp.prototype.destructor = function () {
        this._view.destructor();
    };
    // event helpers
    JetApp.prototype.trigger = function (name) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        this.apply(name, rest);
    };
    JetApp.prototype.apply = function (name, data) {
        this.callEvent(name, data);
    };
    JetApp.prototype.action = function (name) {
        return this.webix.bind(function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i] = arguments[_i];
            }
            this.apply(name, rest);
        }, this);
    };
    JetApp.prototype.on = function (name, handler) {
        this.attachEvent(name, handler);
    };
    JetApp.prototype.use = function (plugin, config) {
        plugin(this, null, config);
    };
    JetApp.prototype.error = function (name, er) {
        this.callEvent(name, er);
        this.callEvent("app:error", er);
        /* tslint:disable */
        if (this.config.debug) {
            for (var i = 0; i < er.length; i++) {
                console.error(er[i]);
                if (er[i] instanceof Error) {
                    var text = er[i].message;
                    if (text.indexOf("Module build failed") === 0) {
                        text = text.replace(/\x1b\[[0-9;]*m/g, "");
                        document.body.innerHTML = "<pre style='font-size:16px; background-color: #ec6873; color: #000; padding:10px;'>" + text + "</pre>";
                    }
                    else {
                        text += "<br><br>Check console for more details";
                        webix.message({ type: "error", text: text, expire: -1 });
                    }
                }
            }
            debugger;
        }
        /* tslint:enable */
    };
    // renders top view
    JetApp.prototype._render = function (url) {
        var _this = this;
        var firstInit = !this.$router;
        if (firstInit) {
            webix.attachEvent("onClick", function (e) { return _this.clickHandler(e); });
            url = this._first_start(url);
        }
        var strUrl = typeof url === "string" ? url : url2str(url);
        return this.canNavigate(strUrl).then(function (newurl) {
            _this.$router.set(newurl, { silent: true });
            return _this._render_stage(newurl);
        }).catch(function () { return false; });
    };
    JetApp.prototype._render_stage = function (url) {
        var _this = this;
        var parsed = (typeof url === "string") ? parse(url) : url;
        // block resizing while rendering parts of UI
        return webix.ui.freeze(function () {
            return _this.createFromURL(parsed, _this._view).then(function (view) {
                // save reference for old and new views
                var oldview = _this._view;
                _this._view = view;
                // render url state for the root
                return view.render(_this._container, parsed, _this._parent).then(function (root) {
                    // destroy and detack old view
                    if (oldview && oldview !== _this._view) {
                        oldview.destructor();
                    }
                    if (_this._view.getRoot().getParentView()) {
                        _this._container = root;
                    }
                    _this._root = root;
                    _this.callEvent("app:route", [parsed]);
                    return view;
                });
            }).catch(function (er) {
                _this.error("app:error:render", [er]);
            });
        });
    };
    JetApp.prototype._urlChange = function (_$url) {
        alert("Not implemented");
        return Promise.resolve(true);
    };
    JetApp.prototype._first_start = function (url) {
        var _this = this;
        var cb = function (a) { return setTimeout(function () {
            _this._render(a);
        }, 1); };
        this.$router = new (this.config.router || HashRouter)(cb, this.config);
        // start animation for top-level app
        if (this._container === document.body && this.config.animation !== false) {
            var node_1 = this._container;
            webix.html.addCss(node_1, "webixappstart");
            setTimeout(function () {
                webix.html.removeCss(node_1, "webixappstart");
                webix.html.addCss(node_1, "webixapp");
            }, 10);
        }
        if (!url || url.length === 1) {
            url = this.$router.get() || this.config.start;
            this.$router.set(url, { silent: true });
        }
        return url;
    };
    // error during view resolving
    JetApp.prototype._loadError = function (url, err) {
        this.error("app:error:resolve", [err, url]);
        return { template: " " };
    };
    JetApp.prototype.addSubView = function (obj, target, config) {
        var url = obj.$subview !== true ? obj.$subview : null;
        var name = obj.name || (url ? this.webix.uid() : "default");
        target.id = obj.id || "s" + this.webix.uid();
        var view = config[name] = { id: target.id, url: url };
        if (view.url instanceof JetView) {
            view.view = view.url;
        }
        return target;
    };
    return JetApp;
}(JetBase));
export { JetApp };
